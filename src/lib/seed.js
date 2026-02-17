export const seedData = [
  {
    id: 'c1',
    nome: 'Maria da Silva',
    telefone: '11987654321',
    dividas: [
      {
        id: 'd1',
        descricao: '2kg de arroz + 1kg feijão',
        valor: 32.50,
        data: '2026-01-15',
        pago: true,
      },
      {
        id: 'd2',
        descricao: 'Óleo, açúcar e café',
        valor: 28.90,
        data: '2026-02-03',
        pago: false,
      },
      {
        id: 'd3',
        descricao: '1 fardo de leite',
        valor: 45.00,
        data: '2026-02-10',
        pago: false,
      },
    ],
  },
  {
    id: 'c2',
    nome: 'João Pereira',
    telefone: '21976543210',
    dividas: [
      {
        id: 'd4',
        descricao: 'Cerveja e refrigerante',
        valor: 52.00,
        data: '2026-01-20',
        pago: true,
      },
      {
        id: 'd5',
        descricao: 'Mistura da semana',
        valor: 67.80,
        data: '2026-02-01',
        pago: false,
      },
    ],
  },
  {
    id: 'c3',
    nome: 'Ana Souza',
    telefone: '31998765432',
    dividas: [
      {
        id: 'd6',
        descricao: 'Pão e frios',
        valor: 18.50,
        data: '2026-01-28',
        pago: true,
      },
      {
        id: 'd7',
        descricao: 'Doces para festa',
        valor: 35.00,
        data: '2026-02-05',
        pago: true,
      },
    ],
  },
]
