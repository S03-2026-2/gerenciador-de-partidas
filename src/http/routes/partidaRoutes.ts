import { Router } from 'express';
import { PartidaController } from '../controllers/PartidaController';

export function criarPartidaRoutes(controller: PartidaController): Router {
  const router = Router();

  /**
   * @openapi
   * /partidas/fila:
   *   post:
   *     tags: [Partidas]
   *     summary: Entra na fila de matchmaking
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EntradaFila'
   *     responses:
   *       201:
   *         description: Par formado e partida criada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Partida'
   *       202:
   *         description: Jogador aguardando adversario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AguardandoAdversario'
   *       400:
   *         description: Identificador ausente ou jogador ja em partida
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Erro'
   *   get:
   *     tags: [Partidas]
   *     summary: Lista os jogadores aguardando na fila
   *     responses:
   *       200:
   *         description: Fila atual
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Fila'
   */
  router.post('/partidas/fila', controller.entrarNaFila);
  router.get('/partidas/fila', controller.consultarFila);

  /**
   * @openapi
   * /partidas/{id}/resultado:
   *   post:
   *     tags: [Partidas]
   *     summary: Registra o resultado enviado pelo sistema de batalhas
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Identificador da partida
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegistroResultado'
   *     responses:
   *       204:
   *         description: Resultado registrado
   *       400:
   *         description: Resultado invalido ou partida inexistente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Erro'
   */
  router.post('/partidas/:id/resultado', controller.registrarResultado);

  /**
   * @openapi
   * /jogadores/{idJogador}/partidas:
   *   get:
   *     tags: [Jogadores]
   *     summary: Consulta o historico de partidas do jogador
   *     parameters:
   *       - in: path
   *         name: idJogador
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Partidas do jogador, da mais recente para a mais antiga
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Partida'
   *       400:
   *         description: Identificador ausente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Erro'
   */
  router.get('/jogadores/:idJogador/partidas', controller.consultarHistorico);

  /**
   * @openapi
   * /jogadores/{idJogador}/pontuacao:
   *   get:
   *     tags: [Jogadores]
   *     summary: Consulta a pontuacao calculada do jogador
   *     parameters:
   *       - in: path
   *         name: idJogador
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Vitorias, derrotas e pontos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Pontuacao'
   *       400:
   *         description: Identificador ausente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Erro'
   */
  router.get('/jogadores/:idJogador/pontuacao', controller.consultarPontuacao);

  return router;
}
