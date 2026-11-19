import { FilaMatchmaking } from './core/domain/FilaMatchmaking';
import { GestaoPartidaService } from './core/services/GestaoPartidaService';
import { PartidaController } from './http/controllers/PartidaController';
import { HttpBatalhaIntegracao } from './infra/integrations/HttpBatalhaIntegracao';
import { PrismaPartidaRepository } from './infra/repositories/PrismaPartidaRepository';
import {PareamentoFIFO} from "./core/domain/PareamentoFIFO";

const partidaRepository = new PrismaPartidaRepository();
const estrategia = new PareamentoFIFO();
const batalhaIntegracao = new HttpBatalhaIntegracao(process.env.BATALHA_API_URL || 'http://localhost:3001');
const partidaService = new GestaoPartidaService(partidaRepository, batalhaIntegracao);
const filaMatchmaking = new FilaMatchmaking(partidaService, estrategia);

export const partidaController = new PartidaController(filaMatchmaking, partidaService);
