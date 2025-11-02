import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { requireAuth } from '../middleware/requireAuth.js';
import { executeSearch } from '../../services/searchService.js';
import { UnsplashRateLimitError } from '../../utils/unsplashClient.js';

const searchSchema = Joi.object({
  term: Joi.string().trim().min(1).max(120).required()
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

const searchRouter = Router();

searchRouter.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  const validation = searchSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

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
    const trimmedTerm = validation.value.term as string;

    const result = await executeSearch({
      term: trimmedTerm,
      rawTerm: trimmedTerm,
      userId
    });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof UnsplashRateLimitError) {
      res.status(429).json({ error: error.message });
      return;
    }

    next(error);
  }
});

export { searchRouter };
