import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import type { CampaignDetail, CampaignSummary } from '@/types';

const listCampaigns = (filters: Record<string, string | number | boolean | undefined> = {}) =>
  apiClient.get<{ campaigns: CampaignSummary[] }>('/api/campaigns', { query: filters });

export const useCampaigns = (filters: Record<string, string | number | boolean | undefined> = {}) =>
  useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => listCampaigns(filters),
  });

export const useCampaignDetail = (id?: number) =>
  useQuery({
    queryKey: ['campaign', id],
    queryFn: () => apiClient.get<{ campaign: CampaignDetail }>('/api/campaigns/' + id),
    enabled: Boolean(id),
  });

export type CampaignPayload = {
  name: string;
  product: string;
  status?: string;
  budgetPlanned?: number;
  goal?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  ownerId?: number;
  alanbaseSub2?: string;
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampaignPayload) =>
      apiClient.post<{ campaign: CampaignSummary }>('/api/campaigns', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useUpdateCampaign = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CampaignPayload>) =>
      apiClient.patch<{ campaign: CampaignSummary }>('/api/campaigns/' + id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      void queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    },
  });
};
