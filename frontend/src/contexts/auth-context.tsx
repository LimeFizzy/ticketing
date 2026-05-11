'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type AuthContextValue } from '@/types/user';
import { getApiAuthMe, postApiAuthSignIn, postApiAuthSignUp, postApiAuthSignOut, UserDto } from '@/lib/api';

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    getApiAuthMe().then(({ data }) => {
      if (data) setUser(data);
    }).catch(err => console.error('Failed to fetch session', err)).finally(() => setIsHydrating(false));
  }, []);

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    const { data, error } = await postApiAuthSignIn({
      body: { email, password }
    });

    if (error) {
        throw new Error(error?.title || 'Login failed');
    }
    
    if (data) {
        setUser(data);
    }
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(async ({ firstName, lastName, email, password }) => {
    const { data, error } = await postApiAuthSignUp({
      body: { firstName, lastName, email, password }
    });

    if (error) {
        throw new Error(error?.title || 'Registration failed');
    }

    if (data) {
        setUser(data);
    }
  }, []);

  const signOut = useCallback<AuthContextValue['signOut']>(async () => {
    await postApiAuthSignOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    (patch) => {
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
