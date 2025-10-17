import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import type { Placement } from '@/types';

export const usePlacements = (filters: Record<string, string | number | boolean | undefined> = {}) =>
  useQuery({
    queryKey: ['placements', filters],
    queryFn: () => apiClient.get<{ placements: Placement[] }>('/api/placements', { query: filters }),
  });

export const useImportPlacements = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => apiClient.postFormData<{ summary: unknown }>('/api/placements/import', formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['placements'] });
    },
  });
};
