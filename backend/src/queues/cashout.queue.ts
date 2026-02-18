import { Queue } from 'bullmq';
import { getBullMQConnection } from '../lib/redis';

export interface CashoutJobData {
  cobrancaId: string;
  dividaId: string;
  empresaId: string;
  valorRecebido: number;   // Valor bruto que entrou na conta Inter
  e2eId: string;           // End-to-End ID do Pix recebido
  pixKeyDestino: string;   // Chave Pix do lojista para o repasse
}

export const cashoutQueue = new Queue<CashoutJobData>('cashout', {
  connection: getBullMQConnection(),
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5_000, // 5s → 10s → 20s → 40s → 80s
    },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 1_000 },
  },
});
