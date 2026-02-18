import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function empresaRoutes(app: FastifyInstance) {
  // POST /empresas — cria uma nova empresa (lojista)
  app.post<{
    Body: { nome: string; cnpj?: string; pixKey: string };
  }>(
    '/empresas',
    {
      schema: {
        body: {
          type: 'object',
          required: ['nome', 'pixKey'],
          properties: {
            nome:   { type: 'string', minLength: 1 },
            cnpj:   { type: 'string' },
            pixKey: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const { nome, cnpj, pixKey } = request.body;
      const empresa = await prisma.empresa.create({
        data: { nome, cnpj, pixKey },
      });
      return reply.status(201).send(empresa);
    }
  );

  // GET /empresas/:id — detalhes da empresa
  app.get<{ Params: { id: string } }>(
    '/empresas/:id',
    async (request, reply) => {
      const empresa = await prisma.empresa.findUnique({
        where: { id: request.params.id },
      });
      if (!empresa) return reply.status(404).send({ error: 'Empresa não encontrada' });
      return reply.send(empresa);
    }
  );

  // PATCH /empresas/:id — atualiza dados da empresa (nome, cnpj, pixKey)
  app.patch<{
    Params: { id: string };
    Body: { nome?: string; cnpj?: string; pixKey?: string };
  }>(
    '/empresas/:id',
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
            nome:   { type: 'string' },
            cnpj:   { type: 'string' },
            pixKey: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const empresa = await prisma.empresa.update({
        where: { id: request.params.id },
        data: request.body,
      });
      return reply.send(empresa);
    }
  );
}
