import { randomUUID } from 'crypto';
import { Partida } from '../entities/Partida';
import { ResultadoPartida } from '../entities/ResultadoPartida';
import { IBatalhaIntegracao } from '../ports/IBatalhaIntegracao';
import { IPartidaRepository } from '../ports/IPartidaRepository';

export class GestaoPartidaService {
  private readonly repository: IPartidaRepository;
  private readonly batalhaIntegracao: IBatalhaIntegracao;

  constructor(repository: IPartidaRepository, batalhaIntegracao: IBatalhaIntegracao) {
    this.repository = repository;
    this.batalhaIntegracao = batalhaIntegracao;
  }

  public async iniciarNovaPartida(idJ1: string, idJ2: string): Promise<Partida> {
    if (!idJ1 || !idJ2) {
      throw new Error('Os identificadores dos dois jogadores sao obrigatorios.');
    }

    if (idJ1 === idJ2) {
      throw new Error('Um jogador nao pode enfrentar a si mesmo.');
    }

    const partida = new Partida(randomUUID(), idJ1, idJ2);
    partida.iniciarBatalha();

    await this.repository.salvarPartida(partida);
    await this.batalhaIntegracao.enviarJogadoresParaBatalha(partida.id, idJ1, idJ2);

    return partida;
  }

  public async receberResultadoBatalha(resultado: ResultadoPartida): Promise<void> {
    if (!resultado.idPartida || !resultado.idVencedor || !resultado.idPerdedor) {
      throw new Error('Dados do resultado da batalha incompletos.');
    }

    await this.repository.salvarResultado(resultado);
  }

  public async consultarHistorico(idJogador: string): Promise<Partida[]> {
    if (!idJogador) {
      throw new Error('O identificador do jogador e obrigatorio.');
    }

    return this.repository.buscarPorJogador(idJogador);
  }
}
