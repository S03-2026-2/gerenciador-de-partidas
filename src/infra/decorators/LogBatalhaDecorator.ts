import { IBatalhaIntegracao, OpcoesEnvioBatalha } from '../../../core/ports/IBatalhaIntegracao';

export interface LoggerSimples {
    info(mensagem: string): void;
    error(mensagem: string): void;
}

export class LogBatalhaDecorator implements IBatalhaIntegracao {
    constructor(
        private readonly interno: IBatalhaIntegracao,
        private readonly logger: LoggerSimples = console
    ) {}

    public async enviarJogadoresParaBatalha(
        idPartida: string,
        idJ1: string,
        idJ2: string,
        opcoes?: OpcoesEnvioBatalha
    ): Promise<void> {
        const inicio = Date.now();
        this.logger.info(`[Batalha] Enviando partida ${idPartida} (${idJ1} vs ${idJ2})...`);

        try {
            await this.interno.enviarJogadoresParaBatalha(idPartida, idJ1, idJ2, opcoes);
            this.logger.info(`[Batalha] Partida ${idPartida} aceita em ${Date.now() - inicio}ms.`);
        } catch (error) {
            const motivo = error instanceof Error ? error.message : String(error);
            this.logger.error(`[Batalha] Partida ${idPartida} falhou apos ${Date.now() - inicio}ms: ${motivo}`);
            throw error;
        }
    }
}