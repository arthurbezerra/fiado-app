import { FastifyInstance } from 'fastify';
import { PrismaClient, DividaStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function dividaRoutes(app: FastifyInstance) {
  // POST /clientes/:clienteId/dividas — registra uma nova dívida (fiado)
  app.post<{
    Params: { clienteId: string };
    Body: { empresaId: string; valor: number; descricao: string };
  }>(
    '/clientes/:clienteId/dividas',
    {
      schema: {
        params: {
          type: 'object',
          properties: { clienteId: { type: 'string' } },
          required: ['clienteId'],
        },
        body: {
          type: 'object',
          required: ['empresaId', 'valor', 'descricao'],
          properties: {
            empresaId: { type: 'string' },
            valor:     { type: 'number', minimum: 0.01 },
            descricao: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const { clienteId } = request.params;
      const { empresaId, valor, descricao } = request.body;
      const divida = await prisma.divida.create({
        data: { clienteId, empresaId, valor, descricao },
      });
      return reply.status(201).send(divida);
    }
  );

  // GET /empresas/:empresaId/dividas — lista dívidas da empresa (usado no dashboard)
  // Por padrão retorna PENDENTE + AGUARDANDO_PAGAMENTO; aceita ?status=PAGO,REPASSADO
  app.get<{
    Params: { empresaId: string };
    Querystring: { status?: string };
  }>(
    '/empresas/:empresaId/dividas',
    {
      schema: {
        params: {
          type: 'object',
          properties: { empresaId: { type: 'string' } },
          required: ['empresaId'],
        },
        querystring: {
          type: 'object',
          properties: { status: { type: 'string' } },
        },
      },
    },
    async (request, reply) => {
      const { empresaId } = request.params;
      const { status } = request.query;

      const statusFilter = status
        ? (status.split(',') as DividaStatus[])
        : (['PENDENTE', 'AGUARDANDO_PAGAMENTO'] as DividaStatus[]);

      const dividas = await prisma.divida.findMany({
        where: { empresaId, status: { in: statusFilter } },
        include: {
          cliente: { select: { id: true, nome: true, telefone: true } },
          cobranca: { select: { txid: true, pixCopiaECola: true, expiracao: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send(dividas);
    }
  );

  // GET /clientes/:clienteId/dividas — lista dívidas de um cliente específico
  app.get<{
    Params: { clienteId: string };
    Querystring: { status?: string };
  }>(
    '/clientes/:clienteId/dividas',
    {
      schema: {
        params: {
          type: 'object',
          properties: { clienteId: { type: 'string' } },
          required: ['clienteId'],
        },
        querystring: {
          type: 'object',
          properties: { status: { type: 'string' } },
        },
      },
    },
    async (request, reply) => {
      const { clienteId } = request.params;
      const { status } = request.query;

      const dividas = await prisma.divida.findMany({
        where: {
          clienteId,
          ...(status ? { status: { in: status.split(',') as DividaStatus[] } } : {}),
        },
        include: {
          cobranca: {
            select: {
              txid: true,
              pixCopiaECola: true,
              qrCodeBase64: true,
              expiracao: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send(dividas);
    }
  );

  // PATCH /dividas/:id — atualiza status (ex: marcar paga manualmente)
  app.patch<{
    Params: { id: string };
    Body: { status: 'PENDENTE' | 'PAGO' };
  }>(
    '/dividas/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['PENDENTE', 'PAGO'] },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { status } = request.body;
      const divida = await prisma.divida.update({
        where: { id },
        data: {
          status,
          paidAt: status === 'PAGO' ? new Date() : null,
        },
      });
      return reply.send(divida);
    }
  );

  // DELETE /dividas/:id — remove uma dívida
  app.delete<{ Params: { id: string } }>(
    '/dividas/:id',
    async (request, reply) => {
      await prisma.divida.delete({ where: { id: request.params.id } });
      return reply.status(204).send();
    }
  );
}
