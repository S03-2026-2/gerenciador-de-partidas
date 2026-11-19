import { Request, Response } from 'express';
import { FilaMatchmaking } from '../../core/domain/FilaMatchmaking';
import { Partida } from '../../core/entities/Partida';
import { GestaoPartidaService } from '../../core/services/GestaoPartidaService';

export class PartidaController {
  private readonly filaMatchmaking: FilaMatchmaking;
  private readonly partidaService: GestaoPartidaService;

  constructor(filaMatchmaking: FilaMatchmaking, partidaService: GestaoPartidaService) {
    this.filaMatchmaking = filaMatchmaking;
    this.partidaService = partidaService;
  }

  public entrarNaFila = async (req: Request, res: Response): Promise<void> => {
    try {
      const idJogador = String(req.body.idJogador ?? '');
      const partida = await this.filaMatchmaking.buscarPartida(idJogador);

      if (partida) {
        res.status(201).json(this.paraResposta(partida));
        return;
      }

      res.status(202).json({ mensagem: 'Aguardando adversario.' });
    } catch (error) {
      res.status(400).json({ erro: this.mensagemDeErro(error) });
    }
  };

  public registrarResultado = async (req: Request, res: Response): Promise<void> => {
    try {
      const idPartida = String(req.params.id ?? req.body.idPartida ?? '');
      const { idVencedor, idPerdedor, pontuacaoJogador1, pontuacaoJogador2, detalhes } = req.body;

      const partida = await this.partidaService.registrarResultadoPartida({
        idPartida,
        idVencedor: String(idVencedor ?? ''),
        idPerdedor: idPerdedor ? String(idPerdedor) : undefined,
        pontuacaoJogador1:
          pontuacaoJogador1 !== undefined && pontuacaoJogador1 !== null
            ? Number(pontuacaoJogador1)
            : undefined,
        pontuacaoJogador2:
          pontuacaoJogador2 !== undefined && pontuacaoJogador2 !== null
            ? Number(pontuacaoJogador2)
            : undefined,
        detalhes: detalhes !== undefined && detalhes !== null ? String(detalhes) : undefined,
      });

      res.status(200).json(this.paraResposta(partida));
    } catch (error) {
      res.status(400).json({ erro: this.mensagemDeErro(error) });
    }
  };

  public consultarHistorico = async (req: Request, res: Response): Promise<void> => {
    try {
      const idJogador = String(req.params.jogadorId ?? req.params.idJogador ?? '');
      const partidas = await this.partidaService.consultarHistorico(idJogador);
      res.status(200).json(partidas.map((partida) => this.paraResposta(partida)));
    } catch (error) {
      res.status(400).json({ erro: this.mensagemDeErro(error) });
    }
  };

  public consultarPontuacao = async (req: Request, res: Response): Promise<void> => {
    try {
      const idJogador = String(req.params.jogadorId ?? req.params.idJogador ?? '');
      const pontuacao = await this.partidaService.consultarPontuacao(idJogador);
      res.status(200).json(pontuacao);
    } catch (error) {
      res.status(400).json({ erro: this.mensagemDeErro(error) });
    }
  };

  public consultarFila = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({ fila: this.filaMatchmaking.obterFila() });
    } catch (error) {
      res.status(400).json({ erro: this.mensagemDeErro(error) });
    }
  };

  private paraResposta(partida: Partida) {
    return {
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
    };
  }

  private mensagemDeErro(error: unknown): string {
    return error instanceof Error ? error.message : 'Erro inesperado.';
  }
}
