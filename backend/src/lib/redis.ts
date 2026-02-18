import Redis from 'ioredis';

// Conexão singleton para uso direto (pub/sub, cache, etc.)
export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on('error', (err) => {
  console.error('[Redis] Erro de conexão:', err.message);
});

// Opções de conexão para BullMQ (evita conflito de tipos entre versões de ioredis)
// BullMQ cria sua própria instância internamente usando estas opções.
export function getBullMQConnection() {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || undefined,
      maxRetriesPerRequest: null as null,
      enableReadyCheck: false,
    };
  } catch {
    return { host: 'localhost', port: 6379, maxRetriesPerRequest: null as null, enableReadyCheck: false };
  }
}
