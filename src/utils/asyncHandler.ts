import { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Envolve um controller assíncrono e encaminha qualquer erro para o
 * errorHandler via next(), evitando repetir try/catch em cada controller.
 */
export function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}