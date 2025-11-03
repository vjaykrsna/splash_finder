import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { getCachedTopSearches, setCachedTopSearches } from '../../cache/topSearchCache.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { fetchTopSearchTerms } from '../../services/topSearchService.js';

const router = Router();

router.get('/', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = getCachedTopSearches();
    if (cached) {
      res.status(200).json({ terms: cached });
      return;
    }

    const terms = await fetchTopSearchTerms();
    setCachedTopSearches(terms);

    res.status(200).json({ terms });
  } catch (error) {
    next(error);
  }
});

export { router as topSearchRouter };
