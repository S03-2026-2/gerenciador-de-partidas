import { Partida } from '../entities/Partida';
import { IRegraPontuacao } from './IRegraPontuacao';

export class PontuacaoPorVitoriaRegra implements IRegraPontuacao {
    constructor(private readonly pontosPorVitoria: number = 3) {}

    public calcular(idJogador: string, partidasFinalizadas: readonly Partida[]): number {
        const vitorias = partidasFinalizadas.filter((partida) => partida.idVencedor === idJogador).length;
        return vitorias * this.pontosPorVitoria;
    }
}