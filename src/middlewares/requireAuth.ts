import { NextFunction, Request, Response } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      teacher?: JwtPayload;
    }
  }
}

/** Exige um JWT válido no header Authorization: Bearer <token>. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Token de autenticação não fornecido', 401));
    return;
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    req.teacher = verifyToken(token);
    next();
  } catch {
    next(new AppError('Token inválido ou expirado', 401));
  }
}