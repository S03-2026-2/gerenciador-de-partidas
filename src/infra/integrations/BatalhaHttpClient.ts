import { ConfigEndpointsBatalha, ErroIntegracaoBatalha,
  OpcoesEnvioBatalha, IBatalhaIntegracao } from '../../core/ports/IBatalhaIntegracao';

const STATUS_TRANSITORIOS = new Set([408, 429]);

function statusEhTransitorio(status: number): boolean {
  return status >= 500 || STATUS_TRANSITORIOS.has(status);
}

export class BatalhaHttpClient implements IBatalhaIntegracao {
  private readonly config: ConfigEndpointsBatalha;

  constructor(config?: Partial<ConfigEndpointsBatalha> | string) {
    if (typeof config === 'string') {
      this.config = {
        urlBase: config,
        endpointIniciarBatalha: process.env.BATALHA_ENDPOINT_INICIAR || '/batalhas',
        endpointCallbackResultado:
          process.env.CALLBACK_RESULTADO_URL ||
          `http://localhost:${process.env.PORT || 3000}/partidas/resultado`,
      };
    } else {
      this.config = {
        urlBase: config?.urlBase || process.env.BATALHA_API_URL || 'http://localhost:3001',
        endpointIniciarBatalha:
          config?.endpointIniciarBatalha || process.env.BATALHA_ENDPOINT_INICIAR || '/batalhas',
        endpointCallbackResultado:
          config?.endpointCallbackResultado ||
          process.env.CALLBACK_RESULTADO_URL ||
          `http://localhost:${process.env.PORT || 3000}/partidas/resultado`,
      };
    }
  }

  public async enviarJogadoresParaBatalha(
    idPartida: string,
    idJ1: string,
    idJ2: string,
    opcoes?: OpcoesEnvioBatalha
  ): Promise<void> {
    const base = this.config.urlBase.replace(/\/+$/, '');
    const caminho = this.config.endpointIniciarBatalha.startsWith('/')
      ? this.config.endpointIniciarBatalha
      : `/${this.config.endpointIniciarBatalha}`;

    let resposta: Response;
    try {
      resposta = await fetch(`${base}${caminho}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPartida,
          idJogador1: idJ1,
          idJogador2: idJ2,
          callbackUrl: this.config.endpointCallbackResultado,
        }),
        signal: opcoes?.signal,
      });
    } catch (error) {
      throw new ErroIntegracaoBatalha('Falha ao enviar jogadores para a batalha: servico indisponivel.', {
        retentavel: true,
        cause: error,
      });
    }

    if (!resposta.ok) {
      throw new ErroIntegracaoBatalha(
          `Falha ao enviar jogadores para a batalha (HTTP ${resposta.status}).`,
          { retentavel: statusEhTransitorio(resposta.status), status: resposta.status }
      );
    }
  }
}
