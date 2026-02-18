/**
 * Processo separado: roda apenas o worker de cashout.
 *
 * Em produção, execute este processo independente do servidor HTTP:
 *   npm run start:worker
 *
 * Isso garante que uma lentidão na API do Inter não bloqueie o servidor
 * que recebe os webhooks.
 */

import 'dotenv/config';
import { cashoutWorker } from './queues/cashout.worker';

console.info('[Worker] Cashout worker iniciado. Aguardando jobs...');

async function shutdown() {
  console.info('[Worker] Encerrando gracefully...');
  await cashoutWorker.close();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
