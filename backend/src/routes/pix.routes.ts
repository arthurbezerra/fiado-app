import { FastifyInstance } from 'fastify';
import { createPixCharge, getPixCharge } from '../services/pix.service';

export async function pixRoutes(app: FastifyInstance) {
  // POST /pix/cobranca — gera QR code dinâmico para uma dívida
  app.post<{
    Body: {
      dividaId: string;
      empresaId: string;
      valor: number;
      descricao: string;
      expiracaoSegundos?: number;
    };
  }>(
    '/pix/cobranca',
    {
      schema: {
        body: {
          type: 'object',
          required: ['dividaId', 'empresaId', 'valor', 'descricao'],
          properties: {
            dividaId:           { type: 'string' },
            empresaId:          { type: 'string' },
            valor:              { type: 'number', minimum: 0.01 },
            descricao:          { type: 'string', maxLength: 140 },
            expiracaoSegundos:  { type: 'integer', minimum: 900 },
          },
        },
      },
    },
    async (request, reply) => {
      const cobranca = await createPixCharge(request.body);
      return reply.status(201).send(cobranca);
    }
  );

  // GET /pix/cobranca/:txid — consulta status da cobrança no Inter
  app.get<{ Params: { txid: string } }>(
    '/pix/cobranca/:txid',
    async (request, reply) => {
      const data = await getPixCharge(request.params.txid);
      return reply.send(data);
    }
  );
}
