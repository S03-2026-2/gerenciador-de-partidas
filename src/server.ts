import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { partidaController } from './container';
import { criarPartidaRoutes } from './http/routes/partidaRoutes';
import { swaggerSpec } from './swagger';

const app = express();

app.use(cors());
app.use(express.json());

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Saude]
 *     summary: Verifica se a API esta no ar
 *     responses:
 *       200:
 *         description: API disponivel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *               required: [status]
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(criarPartidaRoutes(partidaController));

const porta = Number(process.env.PORT) || 3000;

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
