import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import type { Comment, Counterparty } from '@/types';

export const useCounterparties = (filters: Record<string, string | number | boolean | undefined> = {}) =>
  useQuery({
    queryKey: ['counterparties', filters],
    queryFn: () => apiClient.get<{ counterparties: Counterparty[] }>('/api/counterparties', { query: filters }),
  });

type CounterpartyPayload = {
  name: string;
  type: string;
  relationshipType: string;
  contactName?: string;
  email?: string;
  phone?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  ogrnip?: string;
  legalAddress?: string;
  registrationAddress?: string;
  checkingAccount?: string;
  bankName?: string;
  bik?: string;
  correspondentAccount?: string;
  taxPhone?: string;
  paymentDetails?: string;
  isActive?: boolean;
  bloggerIds?: number[];
};

export const useCreateCounterparty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CounterpartyPayload) =>
      apiClient.post<{ counterparty: Counterparty }>('/api/counterparties', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['counterparties'] });
    },
  });
};

export const useUpdateCounterparty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CounterpartyPayload & { id: number }) => {
      const { id, ...body } = payload;
      return apiClient.patch<{ counterparty: Counterparty }>(`/api/counterparties/${id}`, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['counterparties'] });
    },
  });
};

export const useCounterparty = (id: number | null | undefined) => {
  const counterpartyId = typeof id === 'number' && Number.isFinite(id) ? id : null;

  return useQuery({
    queryKey: ['counterparty', counterpartyId],
    enabled: counterpartyId !== null,
    queryFn: () =>
      apiClient.get<{ counterparty: Counterparty; comments: Comment[] }>(
        `/api/counterparties/${counterpartyId!}`,
      ),
  });
};
