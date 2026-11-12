import { randomUUID } from 'crypto';
import { Partida } from '../entities/Partida';
import { ResultadoPartida } from '../entities/ResultadoPartida';
import { StatusPartida } from '../enums/StatusPartida';
import { IBatalhaIntegracao } from '../ports/IBatalhaIntegracao';
import { IPartidaRepository } from '../ports/IPartidaRepository';

export interface PontuacaoJogador {
  idJogador: string;
  partidasJogadas: number;
  vitorias: number;
  derrotas: number;
  pontos: number;
}

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
    await this.repository.salvarPartida(partida);

    await this.batalhaIntegracao.enviarJogadoresParaBatalha(partida.id, idJ1, idJ2);

    partida.iniciarBatalha();
    await this.repository.atualizarPartida(partida);

    return partida;
  }

  public async receberResultadoBatalha(resultado: ResultadoPartida): Promise<void> {
    if (!resultado.idPartida || !resultado.idVencedor || !resultado.idPerdedor) {
      throw new Error('Dados do resultado da batalha incompletos.');
    }

    const partida = await this.repository.buscarPorId(resultado.idPartida);
    if (!partida) {
      throw new Error('Partida nao encontrada.');
    }

    if (partida.status === StatusPartida.FINALIZADA) {
      throw new Error('O resultado desta partida ja foi registrado.');
    }

    const jogadores = [partida.idJogador1, partida.idJogador2];
    if (
      resultado.idVencedor === resultado.idPerdedor ||
      !jogadores.includes(resultado.idVencedor) ||
      !jogadores.includes(resultado.idPerdedor)
    ) {
      throw new Error('Vencedor e perdedor devem ser os jogadores da partida.');
    }

    await this.repository.salvarResultado(resultado);

    partida.concluirPartida(resultado);
    await this.repository.atualizarPartida(partida);
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

    const vitorias = finalizadas.filter((partida) => partida.resultado?.idVencedor === idJogador).length;
    const derrotas = finalizadas.filter((partida) => partida.resultado?.idPerdedor === idJogador).length;

    return {
      idJogador,
      partidasJogadas: finalizadas.length,
      vitorias,
      derrotas,
      pontos: vitorias * 3,
    };
  }
}
