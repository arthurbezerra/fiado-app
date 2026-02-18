/**
 * Script de setup: registra a URL do webhook no Banco Inter.
 *
 * Execute uma única vez ao fazer o deploy ou trocar de ambiente:
 *   npm run setup:webhook
 *
 * Referência da API:
 *   PUT /pix/v2/webhook/{chave}
 *   Requer scope: webhook.write
 */

import 'dotenv/config';
import { createInterClient } from '../lib/inter-client';

async function main() {
  const pixKey = process.env.INTER_PIX_KEY;
  const publicUrl = process.env.PUBLIC_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!pixKey || !publicUrl || !webhookSecret) {
    console.error('❌ Configure INTER_PIX_KEY, PUBLIC_URL e WEBHOOK_SECRET no .env');
    process.exit(1);
  }

  const webhookUrl = `${publicUrl}/webhook/pix/${webhookSecret}`;

  console.info(`🔗 Registrando webhook no Inter...`);
  console.info(`   Chave Pix : ${pixKey}`);
  console.info(`   Webhook   : ${webhookUrl}`);

  const client = await createInterClient();

  // O Inter registra o webhook vinculado a uma chave Pix específica.
  // Todos os Pix recebidos nessa chave dispararão notificações para esta URL.
  await client.put(`/pix/v2/webhook/${encodeURIComponent(pixKey)}`, {
    webhookUrl,
  });

  console.info('✅ Webhook registrado com sucesso!');

  // Verificação: lê o webhook de volta para confirmar
  const check = await client.get(`/pix/v2/webhook/${encodeURIComponent(pixKey)}`);
  console.info('📋 Configuração atual:', JSON.stringify(check.data, null, 2));
}

main().catch((err) => {
  console.error('❌ Falha ao registrar webhook:', err.message);
  process.exit(1);
});
