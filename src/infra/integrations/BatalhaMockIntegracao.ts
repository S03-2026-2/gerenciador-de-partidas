import { IBatalhaIntegracao } from '../../core/ports/IBatalhaIntegracao';
import { GestaoPartidaService } from '../../core/services/GestaoPartidaService';

export interface BatalhaMockConfig {
  callbackResultadoUrl?: string;
  delayMs?: number;
  partidaService?: GestaoPartidaService;
}

export class BatalhaMockIntegracao implements IBatalhaIntegracao {
  private readonly callbackResultadoUrl: string;
  private readonly delayMs: number;
  private readonly partidaService?: GestaoPartidaService;

  constructor(config?: BatalhaMockConfig) {
    const porta = process.env.PORT || 3000;
    this.callbackResultadoUrl =
      config?.callbackResultadoUrl ||
      process.env.CALLBACK_RESULTADO_URL ||
      `http://localhost:${porta}/partidas/resultado`;
    this.delayMs = config?.delayMs ?? Number(process.env.MOCK_BATALHA_DELAY_MS ?? 3000);
    this.partidaService = config?.partidaService;
  }

  public async enviarJogadoresParaBatalha(
    idPartida: string,
    idJ1: string,
    idJ2: string
  ): Promise<void> {
    console.log(
      `[BatalhaMock] Batalha iniciada para partida ${idPartida} (${idJ1} vs ${idJ2}). Simulando desfecho em ${this.delayMs}ms...`
    );

    const timer = setTimeout(() => {
      void this.simularDesfechoBatalha(idPartida, idJ1, idJ2);
    }, this.delayMs);

    if (typeof timer.unref === 'function') {
      timer.unref();
    }
  }

  private async simularDesfechoBatalha(
    idPartida: string,
    idJ1: string,
    idJ2: string
  ): Promise<void> {
    const j1Venceu = Math.random() >= 0.5;
    const idVencedor = j1Venceu ? idJ1 : idJ2;
    const idPerdedor = j1Venceu ? idJ2 : idJ1;
    const pontuacaoVencedor = Math.floor(Math.random() * 50) + 51;
    const pontuacaoPerdedor = Math.floor(Math.random() * 50) + 1;
    const pontuacaoJogador1 = j1Venceu ? pontuacaoVencedor : pontuacaoPerdedor;
    const pontuacaoJogador2 = j1Venceu ? pontuacaoPerdedor : pontuacaoVencedor;
    const detalhes = `Simulacao mock concluida: ${idVencedor} venceu ${idPerdedor} por ${pontuacaoVencedor} a ${pontuacaoPerdedor}.`;

    const payload = {
      idPartida,
      idVencedor,
      idPerdedor,
      pontuacaoJogador1,
      pontuacaoJogador2,
      detalhes,
    };

    try {
      const resposta = await fetch(this.callbackResultadoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resposta.ok && this.partidaService) {
        await this.partidaService.registrarResultadoPartida(payload);
      }

      console.log(
        `[BatalhaMock] Resultado da partida ${idPartida} registrado com sucesso (vencedor: ${idVencedor}).`
      );
    } catch {
      if (this.partidaService) {
        try {
          await this.partidaService.registrarResultadoPartida(payload);
          console.log(
            `[BatalhaMock] Resultado da partida ${idPartida} registrado via fallback local (vencedor: ${idVencedor}).`
          );
        } catch (erroInterno) {
          console.error('[BatalhaMock] Falha ao registrar resultado mock:', erroInterno);
        }
      }
    }
  }
}
