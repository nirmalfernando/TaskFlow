import type { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { ResponseHelper } from '../utils/response';
import { env } from '../config/env.config';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  if (err instanceof ValidationError) {
    return ResponseHelper.error(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof AppError) {
    return ResponseHelper.error(res, err.message, err.statusCode);
  }

  // Unknown error — never leak internals in production
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  console.error('[Unhandled Error]', err);
  return ResponseHelper.error(res, message, 500);
};

export const notFoundMiddleware = (req: Request, res: Response): Response => {
  return ResponseHelper.error(res, `Cannot ${req.method} ${req.originalUrl}`, 404);
};
