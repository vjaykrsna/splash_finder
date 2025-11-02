import type { NextFunction, Request, Response } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const isPassportAuthenticated = typeof req.isAuthenticated === 'function' && req.isAuthenticated();
  const hasSessionUser = Boolean(req.session?.passport?.user);

  if (isPassportAuthenticated || hasSessionUser) {
    next();
    return;
  }

  res.status(401).json({ error: 'Unauthorized' });
};
