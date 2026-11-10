export class FilaMatchmaking {
  protected filaJogadores: string[] = [];

  public buscarPartida(idJogador: string): void {
    if (!this.filaJogadores.includes(idJogador)) {
      this.filaJogadores.push(idJogador);
    }
  }

  protected formarPartida(): [string, string] | null {
    if (this.filaJogadores.length < 2) {
      return null;
    }

    const idJ1 = this.filaJogadores.shift()!;
    const idJ2 = this.filaJogadores.shift()!;
    return [idJ1, idJ2];
  }

  public obterFila(): readonly string[] {
    return [...this.filaJogadores];
  }
}
