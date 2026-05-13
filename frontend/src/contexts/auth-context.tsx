'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type AuthContextValue,
  cardFromUserDto,
  type User,
} from '@/types/user';
import {
  type UserDto,
  getMe,
  postSignIn,
  postSignOut,
  postSignUp,
  updateCard,
  updateProfile as updateProfileApi,
} from '@/lib/api';
import { MOCK_ORGANIZER_EMAILS } from '@/lib/mocks/dashboard';

const inferBrand = (number?: string): string | null => {
  if (!number) return null;
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.startsWith('4')) return 'Visa';
  if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
  if (cleaned.startsWith('3')) return 'Amex';
  return null;
};

const toUser = (dto: UserDto): User => ({
  ...dto,
  role: MOCK_ORGANIZER_EMAILS.has(dto.email) ? 'organizer' : 'attendee',
  card: cardFromUserDto(dto),
});

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        if (data) setUser(toUser(data));
      })
      .catch((err) => console.error('Failed to fetch session', err))
      .finally(() => setIsHydrating(false));
  }, []);

  const signIn = useCallback<AuthContextValue['signIn']>(
    async (email, password) => {
      const { data, error } = await postSignIn({
        body: { email, password },
      });

      if (error) throw new Error(error?.title || 'Login failed');
      if (data) setUser(toUser(data));
    },
    []
  );

  const signUp = useCallback<AuthContextValue['signUp']>(
    async ({ firstName, lastName, email, password }) => {
      const { data, error } = await postSignUp({
        body: { firstName, lastName, email, password },
      });

      if (error) throw new Error(error?.title || 'Registration failed');
      if (data) setUser(toUser(data));
    },
    []
  );

  const signOut = useCallback<AuthContextValue['signOut']>(async () => {
    await postSignOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (patch) => {
      if (!user) return;

      if (patch.firstName !== undefined || patch.email !== undefined) {
        const res = await updateProfileApi({
          body: {
            firstName: patch.firstName ?? user.firstName,
            lastName: patch.lastName ?? user.lastName,
            email: patch.email ?? user.email,
          },
        });
        if (res.data) setUser(toUser(res.data));
        if (res.error) throw new Error('Profile update failed');
        return;
      }

      if (patch.card !== undefined) {
        const card = patch.card;
        const res = await updateCard({
          body: card
            ? {
                cardHolderName: card.cardholderName || undefined,
                cardLast4: card.number?.slice(-4) || undefined,
                cardExpiry: card.expiry || undefined,
                cardBrand: inferBrand(card.number) || undefined,
              }
            : undefined,
        });
        if (res.data) setUser(toUser(res.data));
        if (res.error) throw new Error('Card update failed');
      }
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
