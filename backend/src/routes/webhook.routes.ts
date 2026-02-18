import { FastifyInstance } from 'fastify';
import { handlePixWebhook } from '../controllers/webhook.controller';

export async function webhookRoutes(app: FastifyInstance) {
  // O secret no path é uma camada de segurança básica.
  // O Inter também pode ser configurado para usar mTLS no webhook (mais seguro).
  app.post<{ Params: { secret: string } }>(
    '/webhook/pix/:secret',
    {
      schema: {
        params: {
          type: 'object',
          properties: { secret: { type: 'string' } },
          required: ['secret'],
        },
        body: {
          type: 'object',
          properties: {
            pix: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  endToEndId:  { type: 'string' },
                  txid:        { type: 'string' },
                  chave:       { type: 'string' },
                  valor:       { type: 'string' },
                  horario:     { type: 'string' },
                  infoPagador: { type: 'string' },
                  pagador: {
                    type: 'object',
                    properties: {
                      cpf:  { type: 'string' },
                      cnpj: { type: 'string' },
                      nome: { type: 'string' },
                    },
                  },
                },
                required: ['endToEndId', 'txid', 'chave', 'valor', 'horario'],
              },
            },
          },
        },
      },
    },
    handlePixWebhook
  );
}
