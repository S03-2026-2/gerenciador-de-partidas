import { Partida as PrismaPartida } from '@prisma/client';
import { Partida } from '../../core/entities/Partida';
import { StatusPartida } from '../../core/enums/StatusPartida';
import { IPartidaRepository } from '../../core/ports/IPartidaRepository';
import { prisma } from '../database/prisma';

export class PrismaPartidaRepository implements IPartidaRepository {
  public async salvarPartida(partida: Partida): Promise<void> {
    await prisma.partida.create({
      data: {
        id: partida.id,
        idJogador1: partida.idJogador1,
        idJogador2: partida.idJogador2,
        dataCriacao: partida.dataCriacao,
        status: partida.status,
        idVencedor: partida.idVencedor ?? null,
        idPerdedor: partida.idPerdedor ?? null,
        pontuacaoJogador1: partida.pontuacaoJogador1 ?? null,
        pontuacaoJogador2: partida.pontuacaoJogador2 ?? null,
        detalhes: partida.detalhes ?? null,
      },
    });
  }

  public async buscarPorJogador(idJogador: string): Promise<Partida[]> {
    const linhas = await prisma.partida.findMany({
      where: {
        OR: [{ idJogador1: idJogador }, { idJogador2: idJogador }],
      },
      orderBy: { dataCriacao: 'desc' },
    });

    return linhas.map((linha) => this.paraEntidade(linha));
  }

  public async buscarPorId(id: string): Promise<Partida | null> {
    const linha = await prisma.partida.findUnique({
      where: { id },
    });

    return linha ? this.paraEntidade(linha) : null;
  }

  public async atualizarPartida(partida: Partida): Promise<void> {
    await prisma.partida.update({
      where: { id: partida.id },
      data: {
        status: partida.status,
        idVencedor: partida.idVencedor ?? null,
        idPerdedor: partida.idPerdedor ?? null,
        pontuacaoJogador1: partida.pontuacaoJogador1 ?? null,
        pontuacaoJogador2: partida.pontuacaoJogador2 ?? null,
        detalhes: partida.detalhes ?? null,
      },
    });
  }

  public async buscarPartidaEmAndamento(idJogador: string): Promise<Partida | null> {
    const linha = await prisma.partida.findFirst({
      where: {
        OR: [{ idJogador1: idJogador }, { idJogador2: idJogador }],
        status: { in: [StatusPartida.AGUARDANDO_BATALHA, StatusPartida.EM_BATALHA] },
      },
    });

    return linha ? this.paraEntidade(linha) : null;
  }

  private paraEntidade(linha: PrismaPartida): Partida {
    const dadosResultado = linha.idVencedor
      ? {
          idVencedor: linha.idVencedor,
          idPerdedor: linha.idPerdedor ?? undefined,
          pontuacaoJogador1: linha.pontuacaoJogador1 ?? undefined,
          pontuacaoJogador2: linha.pontuacaoJogador2 ?? undefined,
          detalhes: linha.detalhes ?? undefined,
        }
      : undefined;

    return new Partida(
      linha.id,
      linha.idJogador1,
      linha.idJogador2,
      linha.dataCriacao,
      StatusPartida[linha.status],
      dadosResultado
    );
  }
}
