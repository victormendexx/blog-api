/**
 * Erro customizado que carrega um status HTTP junto com a mensagem.
 * Usado nos services/controllers para sinalizar erros "esperados"
 * (ex: post não encontrado, validação falhou) de forma padronizada.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;

    // Necessário para o instanceof funcionar corretamente com classes
    // que estendem Error, quando compilado para versões antigas de JS
    Object.setPrototypeOf(this, AppError.prototype);
  }
}