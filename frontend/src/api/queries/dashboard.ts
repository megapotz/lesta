import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import type { DashboardSummary, ProductCode } from '@/types';

type DashboardFilters = {
  period?: 'current_month' | 'last_month' | 'quarter' | 'year';
  product?: ProductCode | 'ALL';
};

export const useDashboardSummary = (filters: DashboardFilters = {}) =>
  useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () =>
      apiClient.get<DashboardSummary>('/api/dashboard', {
        query: {
          period: filters.period,
          product: filters.product && filters.product !== 'ALL' ? filters.product : undefined,
        },
      }),
  });
