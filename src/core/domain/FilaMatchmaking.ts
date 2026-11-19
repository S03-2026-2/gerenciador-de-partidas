import { Partida } from '../entities/Partida';
import { ConfigEndpointsBatalha, IBatalhaIntegracao } from '../ports/IBatalhaIntegracao';
import { GestaoPartidaService } from '../services/GestaoPartidaService';

export class FilaMatchmaking {
  private filaJogadores: string[] = [];
  private readonly partidaService: GestaoPartidaService;
  private readonly batalhaIntegracao: IBatalhaIntegracao;
  private readonly endpointsBatalha: ConfigEndpointsBatalha;

  constructor(
    partidaService: GestaoPartidaService,
    batalhaIntegracao: IBatalhaIntegracao,
    endpointsBatalha?: Partial<ConfigEndpointsBatalha>
  ) {
    this.partidaService = partidaService;
    this.batalhaIntegracao = batalhaIntegracao;
    this.endpointsBatalha = {
      urlBase: endpointsBatalha?.urlBase ?? process.env.BATALHA_API_URL ?? 'http://localhost:3001',
      endpointIniciarBatalha:
        endpointsBatalha?.endpointIniciarBatalha ?? process.env.BATALHA_ENDPOINT_INICIAR ?? '/batalhas',
      endpointCallbackResultado:
        endpointsBatalha?.endpointCallbackResultado ?? '/partidas/resultado',
    };
  }

  public obterConfigEndpointsBatalha(): ConfigEndpointsBatalha {
    return { ...this.endpointsBatalha };
  }

  public async buscarPartida(idJogador: string): Promise<Partida | null> {
    const idLimpo = idJogador.trim();
    if (!idLimpo) {
      throw new Error('O identificador do jogador e obrigatorio.');
    }

    if (await this.partidaService.jogadorEstaEmPartida(idLimpo)) {
      throw new Error('O jogador ja esta em uma partida.');
    }

    if (this.filaJogadores.includes(idLimpo)) {
      return null;
    }

    this.filaJogadores.push(idLimpo);
    return this.formarPartida();
  }

  private async formarPartida(): Promise<Partida | null> {
    if (this.filaJogadores.length < 2) {
      return null;
    }

    const idJ1 = this.filaJogadores.shift()!;
    const idJ2 = this.filaJogadores.shift()!;

    try {
      const partida = this.partidaService.criarPartida(idJ1, idJ2);
      await this.batalhaIntegracao.enviarJogadoresParaBatalha(partida.id, idJ1, idJ2);
      return await this.partidaService.salvarPartidaEmBatalha(partida);
    } catch (error) {
      this.filaJogadores.unshift(idJ1, idJ2);
      throw error;
    }
  }

  public obterFila(): readonly string[] {
    return [...this.filaJogadores];
  }
}
