import { IMatchmakingStrategy, ParJogadores } from './IMatchmakingStrategy';

export class Duelo1v1Strategy implements IMatchmakingStrategy {
    public formarPar(fila: readonly string[]): ParJogadores | null {
        if (fila.length < 2) {
            return null;
        }

        return [fila[0], fila[1]];
    }
}