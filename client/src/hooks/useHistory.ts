import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/apiClient';

export interface HistoryItem {
  term: string;
  timestamp: string;
  resultCount: number;
}

interface HistoryResponse {
  searches: HistoryItem[];
}

interface UseHistoryOptions {
  limit?: number;
  cursor?: string;
}

const HISTORY_QUERY_KEY = ['history'];

const fetchHistory = async (options: UseHistoryOptions = {}): Promise<HistoryItem[]> => {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.cursor) params.append('cursor', options.cursor);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient<HistoryResponse>(`/api/history${query}`);
  return response.searches ?? [];
};

export const useHistory = (options: UseHistoryOptions = {}) =>
  useQuery<HistoryItem[], ApiError>({
    queryKey: [...HISTORY_QUERY_KEY, options],
    queryFn: () => fetchHistory(options),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false
  });
