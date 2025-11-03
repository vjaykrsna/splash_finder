import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/apiClient';

export interface TopSearchTerm {
  term: string;
  count: number;
}

interface TopSearchesResponse {
  terms: TopSearchTerm[];
}

const TOP_SEARCHES_QUERY_KEY = ['top-searches'];

const fetchTopSearches = async (): Promise<TopSearchTerm[]> => {
  const response = await apiClient<TopSearchesResponse>('/api/top-searches');
  return response.terms ?? [];
};

export const useTopSearches = () =>
  useQuery<TopSearchTerm[], ApiError>({
    queryKey: TOP_SEARCHES_QUERY_KEY,
    queryFn: fetchTopSearches,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false
  });
