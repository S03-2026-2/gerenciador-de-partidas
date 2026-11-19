import { randomUUID } from 'crypto';
import { Partida } from '../entities/Partida';

export class PartidaFactory {

    public static criar(idJ1: string, idJ2: string): Partida {
        if (!idJ1 || !idJ2) {
            throw new Error('Os jogadores são obrigatórios.');
        }

        if (idJ1 === idJ2) {
            throw new Error('Um jogador não pode enfrentar a si mesmo.');
        }

        return new Partida(
            randomUUID(),
            idJ1,
            idJ2
        );
    }
}