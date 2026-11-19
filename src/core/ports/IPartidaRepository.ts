import { Partida } from '../entities/Partida';

export interface IPartidaRepository {
  salvarPartida(partida: Partida): Promise<void>;
  buscarPorJogador(idJogador: string): Promise<Partida[]>;
  buscarPorId(id: string): Promise<Partida | null>;
  atualizarPartida(partida: Partida): Promise<void>;
  buscarPartidaEmAndamento(idJogador: string): Promise<Partida | null>;
}
