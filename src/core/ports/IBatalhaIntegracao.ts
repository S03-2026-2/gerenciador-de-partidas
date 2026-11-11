export interface IBatalhaIntegracao {
  enviarJogadoresParaBatalha(idPartida: string, idJ1: string, idJ2: string): Promise<void>;
}
