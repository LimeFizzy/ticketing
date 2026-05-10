'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { type AuthContextValue, type User } from '@/types/user';
import { newId, titleCase } from '@/lib/utils';

const STORAGE_KEY = 'ticketflow:user';
const AUTH_EVENT = 'ticketflow:auth';

let cachedUser: User | null | undefined = undefined;

const isValidStoredUser = (value: unknown): value is User => {
  if (!value || typeof value !== 'object') return false;
  const u = value as Partial<User>;
  return (
    typeof u.id === 'string' &&
    typeof u.firstName === 'string' &&
    typeof u.lastName === 'string' &&
    typeof u.email === 'string'
  );
};

const readUser = (): User | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidStoredUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  cachedUser = user;
  window.dispatchEvent(new Event(AUTH_EVENT));
};

const subscribe = (cb: () => void) => {
  if (typeof window === 'undefined') return () => {};

  if (cachedUser === undefined) {
    cachedUser = readUser();
    queueMicrotask(cb);
  }

  const handler = () => {
    cachedUser = readUser();
    cb();
  };
  window.addEventListener('storage', handler);
  window.addEventListener(AUTH_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(AUTH_EVENT, handler);
  };
};

const getSnapshot = () => cachedUser;
const getServerSnapshot = (): User | null | undefined => undefined;

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const isHydrating = snapshot === undefined;
  const user = snapshot ?? null;

  const signIn = useCallback<AuthContextValue['signIn']>((email) => {
    const trimmed = email.trim();
    const local = trimmed.split('@')[0] ?? 'User';
    writeUser({
      id: newId(),
      firstName: titleCase(local),
      lastName: '',
      email: trimmed,
    });
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(
    ({ firstName, lastName, email }) => {
      writeUser({
        id: newId(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
    },
    []
  );

  const signOut = useCallback(() => writeUser(null), []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    (patch) => {
      if (!cachedUser) return;
      writeUser({ ...cachedUser, ...patch });
    },
    []
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
