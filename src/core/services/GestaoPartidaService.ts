import { randomUUID } from 'crypto';
import { DadosResultadoPartida, Partida } from '../entities/Partida';
import { StatusPartida } from '../enums/StatusPartida';
import { IPartidaRepository } from '../ports/IPartidaRepository';

export interface PontuacaoJogador {
  idJogador: string;
  partidasJogadas: number;
  vitorias: number;
  derrotas: number;
  pontos: number;
}

export interface RegistrarResultadoInput extends DadosResultadoPartida {
  idPartida: string;
}

export class GestaoPartidaService {
  private readonly repository: IPartidaRepository;

  constructor(repository: IPartidaRepository) {
    this.repository = repository;
  }

  public criarPartida(idJ1: string, idJ2: string): Partida {
    if (!idJ1 || !idJ2) {
      throw new Error('Os identificadores dos dois jogadores sao obrigatorios.');
    }

    if (idJ1 === idJ2) {
      throw new Error('Um jogador nao pode enfrentar a si mesmo.');
    }

    return new Partida(randomUUID(), idJ1, idJ2);
  }

  public async iniciarNovaPartida(idJ1: string, idJ2: string): Promise<Partida> {
    const partida = this.criarPartida(idJ1, idJ2);
    partida.iniciarBatalha();
    await this.repository.salvarPartida(partida);
    return partida;
  }

  public async salvarPartidaEmBatalha(partida: Partida): Promise<Partida> {
    partida.iniciarBatalha();
    await this.repository.salvarPartida(partida);
    return partida;
  }

  public async registrarResultadoPartida(dados: RegistrarResultadoInput): Promise<Partida> {
    if (!dados.idPartida || !dados.idVencedor) {
      throw new Error('Dados do resultado da batalha incompletos.');
    }

    const partida = await this.repository.buscarPorId(dados.idPartida);
    if (!partida) {
      throw new Error('Partida nao encontrada.');
    }

    if (partida.status === StatusPartida.FINALIZADA) {
      throw new Error('O resultado desta partida ja foi registrado.');
    }

    partida.registrarResultado({
      idVencedor: dados.idVencedor,
      idPerdedor: dados.idPerdedor,
      pontuacaoJogador1: dados.pontuacaoJogador1,
      pontuacaoJogador2: dados.pontuacaoJogador2,
      detalhes: dados.detalhes,
    });

    await this.repository.atualizarPartida(partida);
    return partida;
  }

  public async receberResultadoBatalha(dados: RegistrarResultadoInput): Promise<Partida> {
    return this.registrarResultadoPartida(dados);
  }

  public async consultarHistorico(idJogador: string): Promise<Partida[]> {
    if (!idJogador) {
      throw new Error('O identificador do jogador e obrigatorio.');
    }

    return this.repository.buscarPorJogador(idJogador);
  }

  public async jogadorEstaEmPartida(idJogador: string): Promise<boolean> {
    const partida = await this.repository.buscarPartidaEmAndamento(idJogador);
    return partida !== null;
  }

  public async consultarPontuacao(idJogador: string): Promise<PontuacaoJogador> {
    const historico = await this.consultarHistorico(idJogador);
    const finalizadas = historico.filter((partida) => partida.status === StatusPartida.FINALIZADA);

    const vitorias = finalizadas.filter((partida) => partida.idVencedor === idJogador).length;
    const derrotas = finalizadas.filter((partida) => partida.idPerdedor === idJogador).length;

    return {
      idJogador,
      partidasJogadas: finalizadas.length,
      vitorias,
      derrotas,
      pontos: vitorias * 3,
    };
  }
}
