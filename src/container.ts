import { FilaMatchmaking } from './core/domain/FilaMatchmaking';
import { ConfigEndpointsBatalha, IBatalhaIntegracao } from './core/ports/IBatalhaIntegracao';
import { GestaoPartidaService } from './core/services/GestaoPartidaService';
import { PartidaController } from './http/controllers/PartidaController';
import { BatalhaHttpClient } from './infra/integrations/BatalhaHttpClient';
import { BatalhaMockIntegracao } from './infra/integrations/BatalhaMockIntegracao';
import { PrismaPartidaRepository } from './infra/repositories/PrismaPartidaRepository';
import {Duelo1v1Strategy} from "./core/domain/matchmaking/Duelo1v1Strategy";
import {PontuacaoPorVitoriaRegra} from "./core/scoring/PontuacaoPorVitoriaRegra";
import {LogBatalhaDecorator} from "./infra/decorators/LogBatalhaDecorator";
import {TimeoutBatalhaDecorator} from "./infra/decorators/TimeoutBatalhaDecorator";
import {RetryBatalhaDecorator} from "./infra/decorators/RetryBatalhaDecorator";

function lerNumero(valor: string | undefined, padrao: number, minimo = 0): number {
    const numero = Number(valor);
    return valor !== undefined && valor.trim() !== '' && Number.isFinite(numero) && numero >= minimo
        ? numero
        : padrao;
}

const porta = process.env.PORT || 3000;
const endpointsBatalha: ConfigEndpointsBatalha = {
  urlBase: process.env.BATALHA_API_URL || 'http://localhost:3001',
  endpointIniciarBatalha: process.env.BATALHA_ENDPOINT_INICIAR || '/batalhas',
  endpointCallbackResultado:
    process.env.CALLBACK_RESULTADO_URL || `http://localhost:${porta}/partidas/resultado`,
};

const partidaRepository = new PrismaPartidaRepository();
const regraPontuacao = new PontuacaoPorVitoriaRegra()
const partidaService = new GestaoPartidaService(partidaRepository, regraPontuacao);

const usarMockBatalha = String(process.env.USE_MOCK_BATALHA).toLowerCase() === 'true';

const batalhaHttpResiliente = new RetryBatalhaDecorator(
    new LogBatalhaDecorator(
        new TimeoutBatalhaDecorator(
            new BatalhaHttpClient(endpointsBatalha),
            lerNumero(process.env.BATALHA_TIMEOUT_MS, 5000, 1)
        )
    ),
    {
        maxTentativas: lerNumero(process.env.BATALHA_MAX_TENTATIVAS, 3, 1),
        delayInicialMs: lerNumero(process.env.BATALHA_RETRY_DELAY_MS, 500),
    }
)

const batalhaIntegracao: IBatalhaIntegracao = usarMockBatalha
  ? new BatalhaMockIntegracao({
      callbackResultadoUrl: endpointsBatalha.endpointCallbackResultado,
      partidaService,
    })
  : batalhaHttpResiliente;

const estrategia = new Duelo1v1Strategy();

const filaMatchmaking = new FilaMatchmaking(
  partidaService,
  batalhaIntegracao,
  estrategia,
  endpointsBatalha
);

export const partidaController = new PartidaController(filaMatchmaking, partidaService);
