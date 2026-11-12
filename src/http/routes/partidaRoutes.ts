import { Router } from 'express';
import { PartidaController } from '../controllers/PartidaController';

export function criarPartidaRoutes(controller: PartidaController): Router {
  const router = Router();

  router.post('/partidas/fila', controller.entrarNaFila);
  router.get('/partidas/fila', controller.consultarFila);
  router.post('/partidas/:id/resultado', controller.registrarResultado);
  router.get('/jogadores/:idJogador/partidas', controller.consultarHistorico);
  router.get('/jogadores/:idJogador/pontuacao', controller.consultarPontuacao);

  return router;
}
