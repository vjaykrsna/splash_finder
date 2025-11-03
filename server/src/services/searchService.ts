import { Types } from 'mongoose';
import { SearchRecord } from '../models/SearchRecord.js';
import { clearTopSearchCache } from '../cache/topSearchCache.js';
import type { UnsplashImage } from '../utils/unsplashClient.js';
import { searchUnsplash } from '../utils/unsplashClient.js';

export interface ExecuteSearchInput {
  term: string;
  rawTerm: string;
  userId: string;
}

export interface ExecuteSearchResult {
  term: string;
  resultCount: number;
  images: UnsplashImage[];
}

const sanitizeTerm = (term: string): { normalized: string; raw: string } => {
  const raw = term.trim();
  const normalized = raw.toLowerCase();
  return { normalized, raw };
};

export const executeSearch = async ({ term, rawTerm, userId }: ExecuteSearchInput): Promise<ExecuteSearchResult> => {
  const { normalized, raw } = sanitizeTerm(term);
  const displayTerm = rawTerm?.trim()?.length ? rawTerm.trim() : raw;

  const result = await searchUnsplash(normalized, { userKey: userId });

  await SearchRecord.recordSearch({
    userId: new Types.ObjectId(userId),
    term: normalized,
    rawTerm: displayTerm,
    resultCount: result.total,
    unsplashResponse: result.images
  });

  clearTopSearchCache();

  return {
    term: displayTerm,
    resultCount: result.total,
    images: result.images
  };
};
