import Redis from 'ioredis';

// Conexão singleton compartilhada entre BullMQ e outros consumidores
export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Obrigatório para BullMQ
  enableReadyCheck: false,
});

redis.on('error', (err) => {
  console.error('[Redis] Erro de conexão:', err.message);
});
