import type { TopSearchTerm } from '../services/topSearchService.js';

const DEFAULT_CACHE_TTL_MS = 60 * 1000;

interface CacheEntry {
  terms: TopSearchTerm[];
  expiresAt: number;
}

let cacheEntry: CacheEntry | null = null;

export const getCachedTopSearches = (): TopSearchTerm[] | null => {
  if (!cacheEntry) {
    return null;
  }

  if (cacheEntry.expiresAt <= Date.now()) {
    cacheEntry = null;
    return null;
  }

  return cacheEntry.terms.map((item) => ({ ...item }));
};

export const setCachedTopSearches = (terms: TopSearchTerm[], ttlMs: number = DEFAULT_CACHE_TTL_MS): void => {
  cacheEntry = {
    terms: terms.map((item) => ({ ...item })),
    expiresAt: Date.now() + ttlMs
  };
};

export const clearTopSearchCache = (): void => {
  cacheEntry = null;
};

export const TOP_SEARCH_CACHE_TTL_MS = DEFAULT_CACHE_TTL_MS;
