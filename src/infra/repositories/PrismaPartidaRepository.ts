import { Prisma } from '@prisma/client';
import { Partida } from '../../core/entities/Partida';
import { ResultadoPartida } from '../../core/entities/ResultadoPartida';
import { StatusPartida } from '../../core/enums/StatusPartida';
import { IPartidaRepository } from '../../core/ports/IPartidaRepository';
import { prisma } from '../database/prisma';

type PartidaComResultado = Prisma.PartidaGetPayload<{ include: { resultado: true } }>;

export class PrismaPartidaRepository implements IPartidaRepository {
  public async salvarPartida(partida: Partida): Promise<void> {
    await prisma.partida.create({
      data: {
        id: partida.id,
        idJogador1: partida.idJogador1,
        idJogador2: partida.idJogador2,
        dataCriacao: partida.dataCriacao,
        status: partida.status,
      },
    });
  }

  public async salvarResultado(resultado: ResultadoPartida): Promise<void> {
    await prisma.resultadoPartida.create({
      data: {
        id: resultado.id,
        idPartida: resultado.idPartida,
        idVencedor: resultado.idVencedor,
        idPerdedor: resultado.idPerdedor,
        detalhes: resultado.detalhes,
      },
    });
  }

  public async buscarPorJogador(idJogador: string): Promise<Partida[]> {
    const linhas = await prisma.partida.findMany({
      where: {
        OR: [{ idJogador1: idJogador }, { idJogador2: idJogador }],
      },
      include: { resultado: true },
      orderBy: { dataCriacao: 'desc' },
    });

    return linhas.map((linha) => this.paraEntidade(linha));
  }

  public async buscarPorId(id: string): Promise<Partida | null> {
    const linha = await prisma.partida.findUnique({
      where: { id },
      include: { resultado: true },
    });

    return linha ? this.paraEntidade(linha) : null;
  }

  public async atualizarPartida(partida: Partida): Promise<void> {
    await prisma.partida.update({
      where: { id: partida.id },
      data: { status: partida.status },
    });
  }

  public async buscarPartidaEmAndamento(idJogador: string): Promise<Partida | null> {
    const linha = await prisma.partida.findFirst({
      where: {
        OR: [{ idJogador1: idJogador }, { idJogador2: idJogador }],
        status: { in: [StatusPartida.AGUARDANDO_BATALHA, StatusPartida.EM_BATALHA] },
      },
      include: { resultado: true },
    });

    return linha ? this.paraEntidade(linha) : null;
  }

  private paraEntidade(linha: PartidaComResultado): Partida {
    const resultado = linha.resultado
      ? new ResultadoPartida(
          linha.resultado.id,
          linha.resultado.idPartida,
          linha.resultado.idVencedor,
          linha.resultado.idPerdedor,
          linha.resultado.detalhes
        )
      : undefined;

    return new Partida(
      linha.id,
      linha.idJogador1,
      linha.idJogador2,
      linha.dataCriacao,
      StatusPartida[linha.status],
      resultado
    );
  }
}
