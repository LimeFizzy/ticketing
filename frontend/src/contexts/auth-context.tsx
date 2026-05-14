'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { type AuthContextValue, type User } from '@/types/user';
import {
  type UserDto,
  getMe,
  postSignIn,
  postSignOut,
  postSignUp,
  updateProfile as updateProfileApi,
} from '@/lib/api';
import { initAntiforgery, resetAntiforgeryToken } from '@/lib/antiforgery';

const toUser = (dto: UserDto): User => ({ ...dto });

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    initAntiforgery();
  }, []);

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        if (data) setUser(toUser(data));
      })
      .catch((err) => console.error('Failed to fetch session', err))
      .finally(() => setIsHydrating(false));
  }, []);

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { data, error } = await postSignIn({
      body: { email, password },
    });

    if (error) throw new Error(error?.title || 'Login failed');
    if (data) setUser(toUser(data));
    resetAntiforgeryToken();
  };

  const signUp: AuthContextValue['signUp'] = async ({
    firstName,
    lastName,
    email,
    password,
  }) => {
    const { data, error } = await postSignUp({
      body: { firstName, lastName, email, password },
    });

    if (error) throw new Error(error?.title || 'Registration failed');
    if (data) setUser(toUser(data));
    resetAntiforgeryToken();
  };

  const signOut: AuthContextValue['signOut'] = async () => {
    await postSignOut();
    setUser(null);
    resetAntiforgeryToken();
  };

  const updateProfile: AuthContextValue['updateProfile'] = async (patch) => {
    if (!user) return;

    const { data, error } = await updateProfileApi({
      body: {
        firstName: patch.firstName ?? user.firstName,
        lastName: patch.lastName ?? user.lastName,
        email: patch.email ?? user.email,
        rowVersion: user.rowVersion,
      },
    });
    if (data) setUser(toUser(data));
    if (error) throw new Error('Profile update failed');
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isHydrating,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
