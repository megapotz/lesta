import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import type { Blogger } from '@/types';

export const useBloggers = (filters: Record<string, string | number | boolean | undefined> = {}) =>
  useQuery({
    queryKey: ['bloggers', filters],
    queryFn: () => apiClient.get<{ bloggers: Blogger[] }>('/api/bloggers', { query: filters }),
  });

type BloggerPayload = {
  name: string;
  profileUrl: string;
  socialPlatform?: string;
  followers?: number;
  averageReach?: number;
  primaryChannel?: string;
  primaryContact?: string;
  counterpartyIds?: number[];
};

export const useCreateBlogger = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BloggerPayload) => apiClient.post<{ blogger: Blogger }>('/api/bloggers', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bloggers'] });
    },
  });
};
