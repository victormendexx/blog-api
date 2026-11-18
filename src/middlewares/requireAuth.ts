import { NextFunction, Request, Response } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Exige um JWT válido (professor ou aluno) no header Authorization: Bearer <token>. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Token de autenticação não fornecido', 401));
    return;
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = verifyToken(token);

    // Tokens emitidos antes da Fase 4 não têm perfil: exige um novo login
    if (payload.role !== 'teacher' && payload.role !== 'student') {
      next(new AppError('Token inválido ou expirado', 401));
      return;
    }

    req.user = payload;
    next();
  } catch {
    next(new AppError('Token inválido ou expirado', 401));
  }
}

/** Exige que o usuário autenticado seja professor. Usar sempre depois de `requireAuth`. */
export function requireTeacher(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'teacher') {
    next(new AppError('Apenas professores podem realizar esta ação', 403));
    return;
  }

  next();
}
