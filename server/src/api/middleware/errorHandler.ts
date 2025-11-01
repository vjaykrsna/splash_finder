import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { env } from '../../config/env.js';

type KnownError = Error & {
  status?: number;
  statusCode?: number;
  code?: string;
  details?: unknown;
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Resource not found' });
};

export const errorHandler: ErrorRequestHandler = (
  error: KnownError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = error.status ?? error.statusCode ?? 500;
  const payload: Record<string, unknown> = {
    message: status >= 500 ? 'Internal Server Error' : error.message
  };

  if (error.code) {
    payload.code = error.code;
  }

  if (error.details) {
    payload.details = error.details;
  }

  if (env.nodeEnv !== 'production' && error.stack) {
    payload.stack = error.stack;
  }

  res.status(status).json(payload);
};
