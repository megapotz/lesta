import { createContext, useContext, useEffect, useMemo } from 'react';

import { apiClient } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<{ user: User }>('/api/auth/me');
    return response.user;
  } catch (error) {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    void initialize();
  }, [setLoading, setUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login: async ({ email, password }) => {
      const response = await apiClient.post<{ user: User }>('/api/auth/login', {
        email,
        password,
      });
      setUser(response.user);
    },
    logout: async () => {
      await apiClient.post('/api/auth/logout');
      setUser(null);
    },
    refresh: async () => {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    },
  }), [user, isLoading, setUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
