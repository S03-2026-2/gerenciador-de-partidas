import { Partida } from '../entities/Partida';
import { GestaoPartidaService } from '../services/GestaoPartidaService';
import {IEstrategiaPareamento} from "../ports/IEstrategiaPareamento";

export class FilaMatchmaking {
  private filaJogadores: string[] = [];
  private readonly partidaService: GestaoPartidaService;
  private readonly estrategia: IEstrategiaPareamento;

  constructor(partidaService: GestaoPartidaService, estrategia: IEstrategiaPareamento) {
    this.partidaService = partidaService;
    this.estrategia = estrategia;
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
    const jogadores = this.estrategia.selecionarJogadores(this.filaJogadores);

    if (!jogadores) {
      return null;
    }

    const [idJ1, idJ2] = jogadores;

    try {
      return await this.partidaService.iniciarNovaPartida(idJ1, idJ2);
    } catch (error) {
      this.filaJogadores.unshift(idJ1, idJ2);
      throw error;
    }
  }

  public obterFila(): readonly string[] {
    return [...this.filaJogadores];
  }
}
