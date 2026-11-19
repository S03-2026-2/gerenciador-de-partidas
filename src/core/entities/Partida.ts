import { StatusPartida } from '../enums/StatusPartida';

export interface DadosResultadoPartida {
  idVencedor: string;
  idPerdedor?: string;
  pontuacaoJogador1?: number;
  pontuacaoJogador2?: number;
  detalhes?: string;
}

export class Partida {
  public readonly id: string;
  public readonly idJogador1: string;
  public readonly idJogador2: string;
  public readonly dataCriacao: Date;
  private _status: StatusPartida;
  private _idVencedor?: string;
  private _idPerdedor?: string;
  private _pontuacaoJogador1?: number;
  private _pontuacaoJogador2?: number;
  private _detalhes?: string;

  constructor(
    id: string,
    idJogador1: string,
    idJogador2: string,
    dataCriacao: Date = new Date(),
    status: StatusPartida = StatusPartida.AGUARDANDO_BATALHA,
    dadosResultado?: DadosResultadoPartida
  ) {
    this.id = id;
    this.idJogador1 = idJogador1;
    this.idJogador2 = idJogador2;
    this.dataCriacao = dataCriacao;
    this._status = status;

    if (dadosResultado) {
      this._idVencedor = dadosResultado.idVencedor;
      this._idPerdedor = dadosResultado.idPerdedor;
      this._pontuacaoJogador1 = dadosResultado.pontuacaoJogador1;
      this._pontuacaoJogador2 = dadosResultado.pontuacaoJogador2;
      this._detalhes = dadosResultado.detalhes;
    }
  }

  public get status(): StatusPartida {
    return this._status;
  }

  public get idVencedor(): string | undefined {
    return this._idVencedor;
  }

  public get idPerdedor(): string | undefined {
    return this._idPerdedor;
  }

  public get pontuacaoJogador1(): number | undefined {
    return this._pontuacaoJogador1;
  }

  public get pontuacaoJogador2(): number | undefined {
    return this._pontuacaoJogador2;
  }

  public get detalhes(): string | undefined {
    return this._detalhes;
  }

  public iniciarBatalha(): void {
    this._status = StatusPartida.EM_BATALHA;
  }

  public registrarResultado(dados: DadosResultadoPartida): void {
    const jogadores = [this.idJogador1, this.idJogador2];
    if (!dados.idVencedor || !jogadores.includes(dados.idVencedor)) {
      throw new Error('Vencedor e perdedor devem ser os jogadores da partida.');
    }

    const perdedorCalculado =
      dados.idPerdedor ?? (dados.idVencedor === this.idJogador1 ? this.idJogador2 : this.idJogador1);

    if (perdedorCalculado === dados.idVencedor || !jogadores.includes(perdedorCalculado)) {
      throw new Error('Vencedor e perdedor devem ser os jogadores da partida.');
    }

    this._idVencedor = dados.idVencedor;
    this._idPerdedor = perdedorCalculado;
    this._pontuacaoJogador1 = dados.pontuacaoJogador1;
    this._pontuacaoJogador2 = dados.pontuacaoJogador2;
    this._detalhes = dados.detalhes ?? '';
    this._status = StatusPartida.FINALIZADA;
  }
}
