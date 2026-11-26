import {
    ErroIntegracaoBatalha,
    IBatalhaIntegracao,
    OpcoesEnvioBatalha,
} from '../../../core/ports/IBatalhaIntegracao';

export interface RetryConfig {
    maxTentativas: number;
    delayInicialMs: number;
    esperar?: (ms: number) => Promise<void>;
}

const esperarPadrao = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class RetryBatalhaDecorator implements IBatalhaIntegracao {
    private readonly maxTentativas: number;
    private readonly delayInicialMs: number;
    private readonly esperar: (ms: number) => Promise<void>;

    constructor(
        private readonly interno: IBatalhaIntegracao,
        config: RetryConfig
    ) {
        this.maxTentativas = Math.max(1, Math.floor(config.maxTentativas));
        this.delayInicialMs = config.delayInicialMs;
        this.esperar = config.esperar ?? esperarPadrao;
    }

    public async enviarJogadoresParaBatalha(
        idPartida: string,
        idJ1: string,
        idJ2: string,
        opcoes?: OpcoesEnvioBatalha
    ): Promise<void> {
        for (let tentativa = 1; ; tentativa++) {
            try {
                await this.interno.enviarJogadoresParaBatalha(idPartida, idJ1, idJ2, opcoes);
                return;
            } catch (error) {
                const podeTentarDeNovo =
                    error instanceof ErroIntegracaoBatalha &&
                    error.retentavel &&
                    tentativa < this.maxTentativas &&
                    !opcoes?.signal?.aborted;

                if (!podeTentarDeNovo) {
                    throw error;
                }

                await this.esperar(this.delayInicialMs * 2 ** (tentativa - 1));
            }
        }
    }
}