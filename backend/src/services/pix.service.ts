import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { createInterClient } from '../lib/inter-client';

const prisma = new PrismaClient();

// ─── Geração de txid ──────────────────────────────────────────────────────────
// O Inter exige txid alfanumérico de 26 a 35 caracteres.
// Usamos UUID v4 sem hífens (32 chars hex) — único e rastreável.

function generateTxid(): string {
  return crypto.randomUUID().replace(/-/g, '').toUpperCase();
}

// ─── Criação de Cobrança Pix (QR Code Dinâmico) ───────────────────────────────

export interface CreateChargeInput {
  dividaId: string;
  empresaId: string;
  valor: number;             // Em reais (ex: 50.00)
  descricao: string;
  expiracaoSegundos?: number; // Default: 86400 (24h)
}

export async function createPixCharge(input: CreateChargeInput) {
  const { dividaId, empresaId, valor, descricao, expiracaoSegundos = 86_400 } = input;

  // A chave Pix recebedora é a conta Inter do SaaS (configurada no .env)
  const pixKeyRecebedora = process.env.INTER_PIX_KEY!;
  const txid = generateTxid();

  const client = await createInterClient();

  // PUT /pix/v2/cob/{txid} — cria cobrança dinâmica
  const cobPayload = {
    calendario: {
      expiracao: expiracaoSegundos,
    },
    valor: {
      original: valor.toFixed(2),
    },
    chave: pixKeyRecebedora,
    solicitacaoPagador: descricao.slice(0, 140),
    // infoAdicionais permite rastrear o dividaId e empresaId no payload do Pix
    infoAdicionais: [
      { nome: 'dividaId',  valor: dividaId },
      { nome: 'empresaId', valor: empresaId },
    ],
  };

  const cobResponse = await client.put(`/pix/v2/cob/${txid}`, cobPayload);
  const cob = cobResponse.data;

  // GET /pix/v2/loc/{id}/qrcode — obtém brcode e imagem do QR
  const qrResponse = await client.get(`/pix/v2/loc/${cob.loc.id}/qrcode`);
  const { qrcode: pixCopiaECola, imagemQrcode } = qrResponse.data;

  // Persiste a cobrança e registra o evento de auditoria em uma transação atômica
  const [cobranca] = await prisma.$transaction([
    prisma.cobrancaPix.create({
      data: {
        dividaId,
        empresaId,
        txid,
        locId: cob.loc.id,
        loc: cob.loc.location,
        pixCopiaECola,
        qrCodeBase64: imagemQrcode ?? null,
        valor,
        status: 'ATIVA',
        expiracao: new Date(Date.now() + expiracaoSegundos * 1_000),
      },
    }),
    prisma.transacaoPix.create({
      data: {
        cobrancaId: '', // será preenchido abaixo após o create
        txid,
        tipo: 'COBRANCA_CRIADA',
        status: cob.status,
        valor,
        payload: cob,
      },
    }),
    prisma.divida.update({
      where: { id: dividaId },
      data: { status: 'AGUARDANDO_PAGAMENTO' },
    }),
  ]);

  // Vincula a transação de auditoria à cobrança criada
  await prisma.transacaoPix.updateMany({
    where: { txid, tipo: 'COBRANCA_CRIADA', cobrancaId: '' },
    data: { cobrancaId: cobranca.id },
  });

  return {
    txid,
    pixCopiaECola,
    qrCodeBase64: imagemQrcode,
    expiracao: cobranca.expiracao,
    locUrl: cob.loc.location,
  };
}

// ─── Consulta de Cobrança ─────────────────────────────────────────────────────

export async function getPixCharge(txid: string) {
  const client = await createInterClient();
  const response = await client.get(`/pix/v2/cob/${txid}`);
  return response.data;
}
