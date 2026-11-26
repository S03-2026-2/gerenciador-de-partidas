import { Partida } from '../entities/Partida';

export interface IRegraPontuacao {
    calcular(idJogador: string, partidasFinalizadas: readonly Partida[]): number;
}