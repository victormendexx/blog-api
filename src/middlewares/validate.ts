import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

/**
 * Middleware genérico que valida req.body contra um schema Zod.
 * Se inválido, joga um AppError 400 com as mensagens de erro concatenadas.
 * Se válido, substitui req.body pelos dados já parseados (com trim, etc. aplicados).
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join('; ');
      next(new AppError(message, 400));
      return;
    }

    req.body = result.data;
    next();
  };
}