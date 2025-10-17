import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import type { User } from '@/types';

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get<{ users: User[] }>('/api/users'),
  });

type UserPayload = {
  name: string;
  email: string;
  role: string;
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserPayload) => apiClient.post<{ user: User; invite: unknown }>('/api/users', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<UserPayload> & { status?: string }) =>
      apiClient.patch<{ user: User }>('/api/users/' + id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useRegenerateInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.post<{ user: User; invite: { token: string; temporaryPassword: string } }>(
        '/api/users/' + id + '/regenerate-invite',
        {},
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
