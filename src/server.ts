import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { partidaController } from './container';
import { criarPartidaRoutes } from './http/routes/partidaRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(criarPartidaRoutes(partidaController));

const porta = Number(process.env.PORT) || 3000;

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
