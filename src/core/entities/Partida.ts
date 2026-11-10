import { StatusPartida } from '../enums/StatusPartida';
import { ResultadoPartida } from './ResultadoPartida';

export class Partida {
  public readonly id: string;
  public readonly idJogador1: string;
  public readonly idJogador2: string;
  public readonly dataCriacao: Date;
  private _status: StatusPartida;
  private _resultado?: ResultadoPartida;

  constructor(
    id: string,
    idJogador1: string,
    idJogador2: string,
    dataCriacao: Date = new Date(),
    status: StatusPartida = StatusPartida.AGUARDANDO_BATALHA,
    resultado?: ResultadoPartida
  ) {
    this.id = id;
    this.idJogador1 = idJogador1;
    this.idJogador2 = idJogador2;
    this.dataCriacao = dataCriacao;
    this._status = status;
    this._resultado = resultado;
  }

  public get status(): StatusPartida {
    return this._status;
  }

  public get resultado(): ResultadoPartida | undefined {
    return this._resultado;
  }

  public iniciarBatalha(): void {
    this._status = StatusPartida.EM_BATALHA;
  }

  public concluirPartida(resultado?: ResultadoPartida): void {
    this._status = StatusPartida.FINALIZADA;
    if (resultado) {
      this._resultado = resultado;
    }
  }
}
