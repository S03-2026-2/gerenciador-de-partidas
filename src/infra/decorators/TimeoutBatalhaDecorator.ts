import {
    ErroIntegracaoBatalha,
    IBatalhaIntegracao,
    OpcoesEnvioBatalha,
} from '../../../core/ports/IBatalhaIntegracao';

export class ErroTimeoutBatalha extends ErroIntegracaoBatalha {
    constructor(timeoutMs: number) {
        super(`Tempo limite de ${timeoutMs}ms excedido ao contatar o servico de Batalhas.`, {
            retentavel: true,
        });
        this.name = 'ErroTimeoutBatalha';
    }
}

export class TimeoutBatalhaDecorator implements IBatalhaIntegracao {
    constructor(
        private readonly interno: IBatalhaIntegracao,
        private readonly timeoutMs: number
    ) {}

    public async enviarJogadoresParaBatalha(
        idPartida: string,
        idJ1: string,
        idJ2: string,
        opcoes?: OpcoesEnvioBatalha
    ): Promise<void> {
        const controller = new AbortController();
        const abortar = () => controller.abort();

        if (opcoes?.signal?.aborted) {
            abortar();
        } else {
            opcoes?.signal?.addEventListener('abort', abortar, { once: true });
        }

        let estourou = false;
        const timer = setTimeout(() => {
            estourou = true;
            abortar();
        }, this.timeoutMs);

        try {
            await this.interno.enviarJogadoresParaBatalha(idPartida, idJ1, idJ2, {
                ...opcoes,
                signal: controller.signal,
            });
        } catch (error) {
            if (estourou) {
                throw new ErroTimeoutBatalha(this.timeoutMs);
            }
            throw error;
        } finally {
            clearTimeout(timer);
            opcoes?.signal?.removeEventListener('abort', abortar);
        }
    }
}