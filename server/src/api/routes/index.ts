import type { Application, Router } from 'express';
import { Router as createRouter } from 'express';

export const buildRootRouter = (): Router => {
  const router = createRouter();
  return router;
};

export const registerRoutes = (app: Application): void => {
  const router = buildRootRouter();
  app.use('/api', router);
};
