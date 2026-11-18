import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gerenciamento de Partidas',
      version: '1.0.0',
      description: 'Pareamento de jogadores, registro do resultado da batalha e consulta de historico e pontuacao.',
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      { name: 'Saude', description: 'Disponibilidade da API' },
      { name: 'Partidas', description: 'Fila, partidas e resultados' },
      { name: 'Jogadores', description: 'Historico e pontuacao' },
    ],
    components: {
      schemas: {
        Erro: {
          type: 'object',
          properties: {
            erro: { type: 'string' },
          },
          required: ['erro'],
        },
        ResultadoPartida: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            idPartida: { type: 'string' },
            idVencedor: { type: 'string' },
            idPerdedor: { type: 'string' },
            detalhes: { type: 'string' },
          },
          required: ['id', 'idPartida', 'idVencedor', 'idPerdedor', 'detalhes'],
        },
        Partida: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            idJogador1: { type: 'string' },
            idJogador2: { type: 'string' },
            dataCriacao: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['AGUARDANDO_BATALHA', 'EM_BATALHA', 'FINALIZADA'],
            },
            resultado: { $ref: '#/components/schemas/ResultadoPartida' },
          },
          required: ['id', 'idJogador1', 'idJogador2', 'dataCriacao', 'status'],
        },
        AguardandoAdversario: {
          type: 'object',
          properties: {
            mensagem: { type: 'string', example: 'Aguardando adversario.' },
          },
          required: ['mensagem'],
        },
        EntradaFila: {
          type: 'object',
          properties: {
            idJogador: { type: 'string', example: 'jogador-1' },
          },
          required: ['idJogador'],
        },
        Fila: {
          type: 'object',
          properties: {
            fila: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['fila'],
        },
        RegistroResultado: {
          type: 'object',
          properties: {
            idVencedor: { type: 'string' },
            idPerdedor: { type: 'string' },
            detalhes: { type: 'string' },
          },
          required: ['idVencedor', 'idPerdedor'],
        },
        Pontuacao: {
          type: 'object',
          properties: {
            idJogador: { type: 'string' },
            partidasJogadas: { type: 'integer' },
            vitorias: { type: 'integer' },
            derrotas: { type: 'integer' },
            pontos: { type: 'integer', description: '3 pontos por vitoria' },
          },
          required: ['idJogador', 'partidasJogadas', 'vitorias', 'derrotas', 'pontos'],
        },
      },
    },
  },
  apis: [path.join(__dirname, 'server.ts'), path.join(__dirname, 'http/routes/*.ts')],
};

export const swaggerSpec = swaggerJSDoc(options);
