export interface ConfigEndpointsBatalha {
  urlBase: string;
  endpointIniciarBatalha: string;
  endpointCallbackResultado?: string;
}

export interface OpcoesEnvioBatalha {
  signal?: AbortSignal;
}

export interface IBatalhaIntegracao {
  enviarJogadoresParaBatalha(idPartida: string, idJ1: string, idJ2: string): Promise<void>;
}

export interface OpcoesErroIntegracao {
  retentavel: boolean;
  status?: number;
  cause?: unknown;
}

export class ErroIntegracaoBatalha extends Error {
  public readonly retentavel: boolean;
  public readonly status?: number;

  constructor(mensagem: string, opcoes: OpcoesErroIntegracao) {
    super(mensagem, { cause: opcoes.cause });
    this.name = 'ErroIntegracaoBatalha';
    this.retentavel = opcoes.retentavel;
    this.status = opcoes.status;
  }
}
