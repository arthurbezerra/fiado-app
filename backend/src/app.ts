import Fastify from 'fastify';
import cors from '@fastify/cors';
import { pixRoutes } from './routes/pix.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { empresaRoutes } from './routes/empresa.routes';
import { clienteRoutes } from './routes/cliente.routes';
import { dividaRoutes } from './routes/divida.routes';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
    },
  });

  // Validação de variáveis de ambiente obrigatórias na inicialização
  const required = [
    'DATABASE_URL',
    'REDIS_URL',
    'INTER_CLIENT_ID',
    'INTER_CLIENT_SECRET',
    'INTER_PIX_KEY',
    'INTER_BASE_URL',
    'WEBHOOK_SECRET',
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Variáveis de ambiente ausentes: ${missing.join(', ')}`);
  }

  // Tratamento global de erros não capturados
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const statusCode = error.statusCode ?? 500;
    return reply.status(statusCode).send({
      error: statusCode === 500 ? 'Internal Server Error' : error.message,
    });
  });

  // CORS — permite chamadas do app web/WebView
  app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Rotas
  app.register(empresaRoutes);
  app.register(clienteRoutes);
  app.register(dividaRoutes);
  app.register(pixRoutes);
  app.register(webhookRoutes);

  // Health check
  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

  return app;
}
