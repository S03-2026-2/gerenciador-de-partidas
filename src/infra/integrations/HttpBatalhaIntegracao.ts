import { IBatalhaIntegracao } from '../../core/ports/IBatalhaIntegracao';

export class HttpBatalhaIntegracao implements IBatalhaIntegracao {
  private readonly urlBase: string;

  constructor(urlBase: string) {
    this.urlBase = urlBase;
  }

  public async enviarJogadoresParaBatalha(idPartida: string, idJ1: string, idJ2: string): Promise<void> {
    const resposta = await fetch(`${this.urlBase}/batalhas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idPartida, idJogador1: idJ1, idJogador2: idJ2 }),
    });

    if (!resposta.ok) {
      throw new Error('Falha ao enviar jogadores para a batalha.');
    }
  }
}
