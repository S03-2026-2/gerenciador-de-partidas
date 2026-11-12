import { Partida } from '../entities/Partida';
import { ResultadoPartida } from '../entities/ResultadoPartida';

export interface IPartidaRepository {
  salvarPartida(partida: Partida): Promise<void>;
  salvarResultado(resultado: ResultadoPartida): Promise<void>;
  buscarPorJogador(idJogador: string): Promise<Partida[]>;
  buscarPorId(id: string): Promise<Partida | null>;
  atualizarPartida(partida: Partida): Promise<void>;
  buscarPartidaEmAndamento(idJogador: string): Promise<Partida | null>;
}
