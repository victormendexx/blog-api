import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Middleware de erro centralizado. Precisa ser registrado por último,
 * depois de todas as rotas (Express reconhece pela assinatura de 4 argumentos).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Erro não previsto: loga no servidor mas não vaza detalhes internos pro cliente
  console.error(err);
  res.status(500).json({ success: false, error: 'Erro interno do servidor' });
}