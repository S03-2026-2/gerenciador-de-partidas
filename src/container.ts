import { FilaMatchmaking } from './core/domain/FilaMatchmaking';
import { ConfigEndpointsBatalha, IBatalhaIntegracao } from './core/ports/IBatalhaIntegracao';
import { GestaoPartidaService } from './core/services/GestaoPartidaService';
import { PartidaController } from './http/controllers/PartidaController';
import { BatalhaHttpClient } from './infra/integrations/BatalhaHttpClient';
import { BatalhaMockIntegracao } from './infra/integrations/BatalhaMockIntegracao';
import { PrismaPartidaRepository } from './infra/repositories/PrismaPartidaRepository';
import {Duelo1v1Strategy} from "./core/domain/matchmaking/Duelo1v1Strategy";

const porta = process.env.PORT || 3000;
const endpointsBatalha: ConfigEndpointsBatalha = {
  urlBase: process.env.BATALHA_API_URL || 'http://localhost:3001',
  endpointIniciarBatalha: process.env.BATALHA_ENDPOINT_INICIAR || '/batalhas',
  endpointCallbackResultado:
    process.env.CALLBACK_RESULTADO_URL || `http://localhost:${porta}/partidas/resultado`,
};

const partidaRepository = new PrismaPartidaRepository();
const partidaService = new GestaoPartidaService(partidaRepository);

const usarMockBatalha = String(process.env.USE_MOCK_BATALHA).toLowerCase() === 'true';

const batalhaIntegracao: IBatalhaIntegracao = usarMockBatalha
  ? new BatalhaMockIntegracao({
      callbackResultadoUrl: endpointsBatalha.endpointCallbackResultado,
      partidaService,
    })
  : new BatalhaHttpClient(endpointsBatalha);

const estrategia = new Duelo1v1Strategy();

const filaMatchmaking = new FilaMatchmaking(
  partidaService,
  batalhaIntegracao,
  estrategia,
  endpointsBatalha
);

export const partidaController = new PartidaController(filaMatchmaking, partidaService);
