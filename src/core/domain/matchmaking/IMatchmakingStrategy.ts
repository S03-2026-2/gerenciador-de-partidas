export type ParJogadores = readonly [string, string];

export interface IMatchmakingStrategy {
    formarPar(fila: readonly string[]): ParJogadores | null;
}