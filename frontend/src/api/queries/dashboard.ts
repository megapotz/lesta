import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import type { DashboardSummary } from '@/types';

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get<DashboardSummary>('/api/dashboard'),
  });
