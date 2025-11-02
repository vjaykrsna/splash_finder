import { URLSearchParams } from 'node:url';
import { env } from '../config/env.js';

const API_BASE_URL = 'https://api.unsplash.com';
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10_000;

export class UnsplashRateLimitError extends Error {
  constructor(message = 'Rate limit exceeded for Unsplash API') {
    super(message);
    this.name = 'UnsplashRateLimitError';
  }
}

export interface UnsplashClientOptions {
  perPage?: number;
  userKey: string;
}

export interface UnsplashImage {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  description?: string | null;
  photographer?: string | null;
}

export interface UnsplashSearchResult {
  total: number;
  images: UnsplashImage[];
}

class RateLimiter {
  private readonly buckets = new Map<string, { count: number; windowStartedAt: number }>();

  public assertWithinLimit(key: string): void {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket) {
      this.buckets.set(key, { count: 1, windowStartedAt: now });
      return;
    }

    if (now - bucket.windowStartedAt > RATE_LIMIT_WINDOW_MS) {
      this.buckets.set(key, { count: 1, windowStartedAt: now });
      return;
    }

    if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
      throw new UnsplashRateLimitError();
    }

    bucket.count += 1;
  }
}

const rateLimiter = new RateLimiter();

const normalizeImage = (result: any): UnsplashImage => ({
  id: result.id,
  thumbUrl: result.urls?.thumb ?? '',
  fullUrl: result.urls?.full ?? '',
  description: result.alt_description ?? null,
  photographer: result.user?.name ?? null
});

export const searchUnsplash = async (
  term: string,
  { perPage = 20, userKey }: UnsplashClientOptions
): Promise<UnsplashSearchResult> => {
  rateLimiter.assertWithinLimit(userKey);

  const searchParams = new URLSearchParams({
    query: term,
    per_page: perPage.toString()
  });

  const response = await fetch(`${API_BASE_URL}/search/photos?${searchParams.toString()}`, {
    headers: {
      Authorization: `Client-ID ${env.unsplashAccessKey}`
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 429) {
      throw new UnsplashRateLimitError();
    }

    throw new Error(
      `Unsplash API error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`
    );
  }

  const payload = (await response.json()) as { total: number; results: any[] };

  return {
    total: payload.total,
    images: payload.results.map(normalizeImage)
  };
};
