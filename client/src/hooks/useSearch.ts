import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/apiClient';
import type { SearchImage } from '@/components/search/SearchGrid';

export interface SearchResponse {
  term: string;
  resultCount: number;
  images: SearchImage[];
}

export const useSearch = () =>
  useMutation<SearchResponse, ApiError, string>({
    mutationKey: ['search'],
    mutationFn: async (term: string) =>
      await apiClient<SearchResponse>('/api/search', {
        method: 'POST',
        json: { term }
      })
  });
