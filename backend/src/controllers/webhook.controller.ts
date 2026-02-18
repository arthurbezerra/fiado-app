import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';
import { cashoutQueue } from '../queues/cashout.queue';

const prisma = new PrismaClient();

// ─── Tipos do payload enviado pelo Inter ──────────────────────────────────────

interface PixEvent {
  endToEndId: string;  // End-to-End ID do Banco Central
  txid: string;        // Nosso txid vinculado à cobrança
  chave: string;       // Chave Pix recebedora
  valor: string;       // Valor em string com 2 casas (ex: "50.00")
  horario: string;     // ISO 8601 com timezone BR
  infoPagador?: string;
  pagador?: {
    cpf?: string;
    cnpj?: string;
    nome: string;
  };
}

export interface WebhookBody {
  pix?: PixEvent[];
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function handlePixWebhook(
  request: FastifyRequest<{ Params: { secret: string }; Body: WebhookBody }>,
  reply: FastifyReply
): Promise<void> {
  // 1. Validação do secret na URL
  if (request.params.secret !== process.env.WEBHOOK_SECRET) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const { pix } = request.body;

  // 2. O Inter exige resposta 2xx RÁPIDA (< 5s) para não marcar o webhook como falho.
  //    Respondemos imediatamente e processamos de forma assíncrona.
  reply.status(200).send({ ok: true });

  if (!pix?.length) return;

  // 3. Processa cada evento Pix de forma independente (um erro não bloqueia os outros)
  for (const event of pix) {
    processPixEvent(event, request.log).catch((err) => {
      request.log.error({ err, txid: event.txid }, '[Webhook] Falha ao processar evento Pix');
    });
  }
}

// ─── Processamento assíncrono de cada evento ──────────────────────────────────

async function processPixEvent(event: PixEvent, log: FastifyRequest['log']): Promise<void> {
  const cobranca = await prisma.cobrancaPix.findUnique({
    where: { txid: event.txid },
    include: {
      divida: {
        include: { empresa: true },
      },
    },
  });

  // txid não encontrado: pode ser pagamento externo ou de outro sistema
  if (!cobranca) {
    log.warn({ txid: event.txid }, '[Webhook] txid não encontrado — ignorando');
    return;
  }

  // Idempotência: se já processamos este pagamento, não enfileiramos de novo
  if (cobranca.status === 'CONCLUIDA') {
    log.info({ txid: event.txid }, '[Webhook] Cobrança já concluída — ignorando');
    return;
  }

  const valorRecebido = parseFloat(event.valor);

  // Atualiza status da cobrança e da dívida atomicamente
  await prisma.$transaction([
    prisma.cobrancaPix.update({
      where: { id: cobranca.id },
      data: { status: 'CONCLUIDA' },
    }),
    prisma.divida.update({
      where: { id: cobranca.dividaId },
      data: { status: 'PAGO', paidAt: new Date(event.horario) },
    }),
    prisma.transacaoPix.create({
      data: {
        cobrancaId: cobranca.id,
        txid: event.txid,
        e2eId: event.endToEndId,
        tipo: 'PAGAMENTO_RECEBIDO',
        status: 'CONCLUIDA',
        valor: valorRecebido,
        pagador: event.pagador ? (event.pagador as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        payload: event as unknown as Prisma.InputJsonValue,
      },
    }),
  ]);

  log.info({ txid: event.txid, valor: valorRecebido }, '[Webhook] Pagamento registrado');

  // Enfileira o repasse para o lojista
  // jobId garante deduplicação: mesmo que o webhook chegue duplicado,
  // o BullMQ descarta o job repetido.
  await cashoutQueue.add(
    'process-cashout',
    {
      cobrancaId: cobranca.id,
      dividaId: cobranca.dividaId,
      empresaId: cobranca.empresaId,
      valorRecebido,
      e2eId: event.endToEndId,
      pixKeyDestino: cobranca.divida.empresa.pixKey,
    },
    {
      jobId: `cashout-${cobranca.id}`, // Chave de deduplicação no BullMQ
    }
  );

  log.info({ cobrancaId: cobranca.id }, '[Webhook] Job de cashout enfileirado');
}
