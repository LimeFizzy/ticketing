'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type AuthContextValue, type User } from '@/types/user';

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  // Fetch current session from API
  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      })
      .catch((err) => console.error('Failed to fetch session', err))
      .finally(() => setIsHydrating(false));
  }, []);

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    const res = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
    }

    const data = await res.json();
    setUser(data);
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(async ({ firstName, lastName, email, password }) => {
    const res = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
    }

    const data = await res.json();
    setUser(data);
  }, []);

  const signOut = useCallback<AuthContextValue['signOut']>(async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    setUser(null);
  }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    (patch) => {
      // Mocked locally until API supports profile updates
      if (!user) return;
      setUser({ ...user, ...patch });
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isHydrating,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [user, isHydrating, signIn, signUp, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
