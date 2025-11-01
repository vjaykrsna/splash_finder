const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = Omit<RequestInit, 'method'> & {
  method?: HttpMethod;
  json?: unknown;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const buildUrl = (path: string): string => {
  const trimmed = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL.replace(/\/$/, '')}${trimmed}`;
};

export const apiClient = async <TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> => {
  const { method = 'GET', headers, json, ...rest } = options;

  const requestHeaders = new Headers(headers);
  if (json !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const init: RequestInit = {
    credentials: 'include',
    method,
    headers: requestHeaders,
    ...rest
  };

  if (json !== undefined) {
    init.body = JSON.stringify(json);
  }

  const response = await fetch(buildUrl(path), init);
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError('Request failed', response.status, payload);
  }

  return payload as TResponse;
};
