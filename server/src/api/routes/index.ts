import type { Application, Router } from 'express';
import { Router as createRouter } from 'express';
import { authRouter } from './authRoutes.js';
import { searchRouter } from './searchRoutes.js';
import { topSearchRouter } from './topSearchRoutes.js';

export const buildRootRouter = (): Router => {
  const router = createRouter();
  router.use('/auth', authRouter);
  router.use('/search', searchRouter);
  router.use('/top-searches', topSearchRouter);
  return router;
};

export const registerRoutes = (app: Application): void => {
  const router = buildRootRouter();
  app.use('/api', router);
};
