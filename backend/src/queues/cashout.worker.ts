import { Worker, Job } from 'bullmq';
import { PrismaClient, CashoutStatus } from '@prisma/client';
import { redis } from '../lib/redis';
import { createInterClient } from '../lib/inter-client';
import { CashoutJobData } from './cashout.queue';

const prisma = new PrismaClient();
const TAXA_PERCENT = parseFloat(process.env.TAXA_PLATAFORMA_PERCENT ?? '0');

// ─── Processador do Job ───────────────────────────────────────────────────────

async function processCashout(job: Job<CashoutJobData>): Promise<void> {
  const { cobrancaId, dividaId, valorRecebido, e2eId, pixKeyDestino } = job.data;

  // A chave de idempotência garante que, mesmo que o job seja executado
  // múltiplas vezes (retry), a API do Inter não processe dois pagamentos.
  const idempotencyKey = `cashout-${cobrancaId}`;

  const valorTaxa  = valorRecebido * (TAXA_PERCENT / 100);
  const valorLiquido = parseFloat((valorRecebido - valorTaxa).toFixed(2));

  // Upsert: cria o registro de cashout na primeira tentativa,
  // incrementa tentativas nas retentativas.
  const cashout = await prisma.cashout.upsert({
    where: { idempotencyKey },
    create: {
      cobrancaId,
      idempotencyKey,
      valor: valorLiquido,
      taxa: parseFloat(valorTaxa.toFixed(2)),
      pixKeyDestino,
      status: 'PROCESSANDO',
      tentativas: 1,
    },
    update: {
      status: 'PROCESSANDO',
      tentativas: { increment: 1 },
    },
  });

  // Idempotência no nível da aplicação: se já concluiu, não faz nada
  if (cashout.status === CashoutStatus.CONCLUIDO) {
    await job.log('Cashout já concluído anteriormente. Ignorando.');
    return;
  }

  const client = await createInterClient();

  let endToEndId: string;

  try {
    await prisma.transacaoPix.create({
      data: {
        cobrancaId,
        txid: idempotencyKey,
        e2eId,
        tipo: 'REPASSE_INICIADO',
        status: 'PROCESSANDO',
        valor: valorLiquido,
        payload: { cobrancaId, pixKeyDestino, valorLiquido, tentativa: cashout.tentativas },
      },
    });

    // POST /banking/v2/pix — envia o repasse via Pix
    // x-id-idempotente: header obrigatório para idempotência no lado do Inter
    const response = await client.post(
      '/banking/v2/pix',
      {
        valor: valorLiquido,
        descricao: `Repasse Fiado #${cobrancaId.slice(0, 8)}`,
        destinatario: {
          tipo: 'CHAVE',
          chave: pixKeyDestino,
        },
      },
      {
        headers: { 'x-id-idempotente': idempotencyKey },
      }
    );

    endToEndId = response.data.endToEndId ?? response.data.codigoTransacao;

  } catch (err: any) {
    // Falha na chamada à API: atualiza status e registra o erro
    const errorMessage: string = err.message ?? 'Erro desconhecido';

    await prisma.$transaction([
      prisma.cashout.update({
        where: { idempotencyKey },
        data: { status: 'FALHOU', erroMensagem: errorMessage },
      }),
      prisma.transacaoPix.create({
        data: {
          cobrancaId,
          txid: idempotencyKey,
          tipo: 'REPASSE_FALHOU',
          status: 'FALHOU',
          payload: { error: errorMessage, tentativa: cashout.tentativas },
        },
      }),
    ]);

    // Re-throw para que o BullMQ marque o job como falho e faça retry
    throw err;
  }

  // Sucesso: atualiza cashout, dívida e registra auditoria atomicamente
  await prisma.$transaction([
    prisma.cashout.update({
      where: { idempotencyKey },
      data: {
        status: 'CONCLUIDO',
        endToEndId,
        processadoAt: new Date(),
      },
    }),
    prisma.divida.update({
      where: { id: dividaId },
      data: { status: 'REPASSADO' },
    }),
    prisma.transacaoPix.create({
      data: {
        cobrancaId,
        txid: idempotencyKey,
        e2eId: endToEndId,
        tipo: 'REPASSE_CONCLUIDO',
        status: 'CONCLUIDO',
        valor: valorLiquido,
        payload: { endToEndId, pixKeyDestino, valorLiquido },
      },
    }),
  ]);

  await job.log(`Repasse concluído. E2E: ${endToEndId}`);
}

// ─── Worker ───────────────────────────────────────────────────────────────────

export const cashoutWorker = new Worker<CashoutJobData>('cashout', processCashout, {
  connection: redis,
  concurrency: 5,
});

cashoutWorker.on('completed', (job) => {
  console.info(`[Cashout] Job ${job.id} concluído — cobrancaId: ${job.data.cobrancaId}`);
});

cashoutWorker.on('failed', (job, err) => {
  console.error(`[Cashout] Job ${job?.id} falhou (tentativa ${job?.attemptsMade}):`, err.message);
});
