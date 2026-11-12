import { Partida } from '../entities/Partida';
import { GestaoPartidaService } from '../services/GestaoPartidaService';

export class FilaMatchmaking {
  private filaJogadores: string[] = [];
  private readonly partidaService: GestaoPartidaService;

  constructor(partidaService: GestaoPartidaService) {
    this.partidaService = partidaService;
  }

  public async buscarPartida(idJogador: string): Promise<Partida | null> {
    const idLimpo = idJogador.trim();
    if (!idLimpo) {
      throw new Error('O identificador do jogador e obrigatorio.');
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

    return this.partidaService.iniciarNovaPartida(idJ1, idJ2);
  }

  public obterFila(): readonly string[] {
    return [...this.filaJogadores];
  }
}
