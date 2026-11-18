import { AppError } from './AppError';

/**
 * Converte o erro de índice único do MongoDB (código 11000) em um AppError 409.
 * Qualquer outro erro é relançado sem alteração.
 */
export function rethrowDuplicateEmail(error: unknown): never {
  if (typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000) {
    throw new AppError('Já existe um cadastro com este email', 409);
  }

  throw error;
}
