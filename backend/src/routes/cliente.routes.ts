import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function clienteRoutes(app: FastifyInstance) {
  // POST /empresas/:empresaId/clientes — cria cliente vinculado à empresa
  app.post<{
    Params: { empresaId: string };
    Body: { nome: string; telefone?: string; cpf?: string };
  }>(
    '/empresas/:empresaId/clientes',
    {
      schema: {
        params: {
          type: 'object',
          properties: { empresaId: { type: 'string' } },
          required: ['empresaId'],
        },
        body: {
          type: 'object',
          required: ['nome'],
          properties: {
            nome:     { type: 'string', minLength: 1 },
            telefone: { type: 'string' },
            cpf:      { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { empresaId } = request.params;
      const { nome, telefone, cpf } = request.body;
      const cliente = await prisma.cliente.create({
        data: { empresaId, nome, telefone, cpf },
      });
      return reply.status(201).send(cliente);
    }
  );

  // GET /empresas/:empresaId/clientes — lista clientes com busca opcional por nome
  // Retorna cada cliente com o total em aberto calculado no servidor
  app.get<{
    Params: { empresaId: string };
    Querystring: { q?: string };
  }>(
    '/empresas/:empresaId/clientes',
    {
      schema: {
        params: {
          type: 'object',
          properties: { empresaId: { type: 'string' } },
          required: ['empresaId'],
        },
        querystring: {
          type: 'object',
          properties: { q: { type: 'string' } },
        },
      },
    },
    async (request, reply) => {
      const { empresaId } = request.params;
      const { q } = request.query;

      const clientes = await prisma.cliente.findMany({
        where: {
          empresaId,
          ...(q ? { nome: { contains: q, mode: 'insensitive' } } : {}),
        },
        include: {
          dividas: {
            where: { status: { in: ['PENDENTE', 'AGUARDANDO_PAGAMENTO'] } },
            select: { valor: true },
          },
        },
        orderBy: { nome: 'asc' },
      });

      // Agrega o total em aberto por cliente e remove a lista de dívidas
      const result = clientes.map(({ dividas, ...c }) => ({
        ...c,
        totalAberto: dividas.reduce((sum, d) => sum + Number(d.valor), 0),
      }));

      return reply.send(result);
    }
  );

  // GET /clientes/:id — detalhes do cliente com histórico completo de dívidas
  app.get<{ Params: { id: string } }>(
    '/clientes/:id',
    async (request, reply) => {
      const cliente = await prisma.cliente.findUnique({
        where: { id: request.params.id },
        include: {
          dividas: {
            orderBy: { createdAt: 'desc' },
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
          },
        },
      });
      if (!cliente) return reply.status(404).send({ error: 'Cliente não encontrado' });
      return reply.send(cliente);
    }
  );

  // PATCH /clientes/:id — atualiza dados do cliente
  app.patch<{
    Params: { id: string };
    Body: { nome?: string; telefone?: string; cpf?: string };
  }>(
    '/clientes/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            nome:     { type: 'string' },
            telefone: { type: 'string' },
            cpf:      { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const cliente = await prisma.cliente.update({
        where: { id: request.params.id },
        data: request.body,
      });
      return reply.send(cliente);
    }
  );

  // DELETE /clientes/:id — remove cliente e suas dívidas (cascade definido no schema)
  app.delete<{ Params: { id: string } }>(
    '/clientes/:id',
    async (request, reply) => {
      await prisma.cliente.delete({ where: { id: request.params.id } });
      return reply.status(204).send();
    }
  );
}
