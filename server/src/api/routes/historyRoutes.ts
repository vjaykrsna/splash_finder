import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { requireAuth } from '../middleware/requireAuth.js';
import { fetchUserHistory } from '../../services/historyService.js';

const historySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional(),
  cursor: Joi.string().optional()
});

const resolveUserId = (req: Request): string | null => {
  const userFromPassport = req.user as { id?: string; _id?: string } | undefined;
  if (userFromPassport?.id) {
    return userFromPassport.id;
  }
  if (userFromPassport?._id) {
    return userFromPassport._id;
  }
  const sessionUser = req.session?.passport?.user;
  if (typeof sessionUser === 'string') {
    return sessionUser;
  }
  return null;
};

const historyRouter = Router();

historyRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const validation = historySchema.validate(req.query, { abortEarly: false, stripUnknown: true });

  if (validation.error) {
    res.status(400).json({ error: validation.error.message });
    return;
  }

  const userId = resolveUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { limit, cursor } = validation.value;

    const result = await fetchUserHistory({ userId, limit, cursor });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export { historyRouter };
