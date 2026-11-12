import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { FilaMatchmaking } from '../../core/domain/FilaMatchmaking';
import { Partida } from '../../core/entities/Partida';
import { ResultadoPartida } from '../../core/entities/ResultadoPartida';
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
      const { idVencedor, idPerdedor, detalhes } = req.body;
      const resultado = new ResultadoPartida(randomUUID(), req.params.id, idVencedor, idPerdedor, detalhes ?? '');

      await this.partidaService.receberResultadoBatalha(resultado);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ erro: this.mensagemDeErro(error) });
    }
  };

  public consultarHistorico = async (req: Request, res: Response): Promise<void> => {
    try {
      const partidas = await this.partidaService.consultarHistorico(req.params.idJogador);
      res.status(200).json(partidas.map((partida) => this.paraResposta(partida)));
    } catch (error) {
      res.status(400).json({ erro: this.mensagemDeErro(error) });
    }
  };

  public consultarPontuacao = async (req: Request, res: Response): Promise<void> => {
    try {
      const pontuacao = await this.partidaService.consultarPontuacao(req.params.idJogador);
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
      resultado: partida.resultado,
    };
  }

  private mensagemDeErro(error: unknown): string {
    return error instanceof Error ? error.message : 'Erro inesperado.';
  }
}
