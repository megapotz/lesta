import { create } from 'zustand';

import type { User } from '@/types';

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setLoading: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),
}));
