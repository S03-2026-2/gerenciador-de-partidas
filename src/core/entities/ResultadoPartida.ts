export class ResultadoPartida {
  public readonly id: string;
  public readonly idPartida: string;
  public readonly idVencedor: string;
  public readonly idPerdedor: string;
  public readonly detalhes: string;

  constructor(
    id: string,
    idPartida: string,
    idVencedor: string,
    idPerdedor: string,
    detalhes: string
  ) {
    this.id = id;
    this.idPartida = idPartida;
    this.idVencedor = idVencedor;
    this.idPerdedor = idPerdedor;
    this.detalhes = detalhes;
  }
}
