import { IEstrategiaPareamento }
    from '../ports/IEstrategiaPareamento';

export class PareamentoFIFO
    implements IEstrategiaPareamento {

    public selecionarJogadores(jogadores: string[]): [string, string] | null {
        if (jogadores.length < 2) {
            return null;
        }

        const jogador1 = jogadores.shift()!;
        const jogador2 = jogadores.shift()!;

        return [jogador1, jogador2];
    }
}