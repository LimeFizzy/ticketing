import { UserDto } from '@/lib/api';

export type UserRole = 'attendee' | 'organizer';

export interface PaymentCard {
  cardholderName: string;
  number: string;
  expiry: string;
  cvc: string;
}

export interface User extends UserDto {
  role: UserRole;
  card?: PaymentCard;
}

export const cardFromUserDto = (user: UserDto): PaymentCard | undefined => {
  if (!user.cardLast4) return undefined;
  return {
    cardholderName: user.cardHolderName ?? '',
    number: user.cardLast4,
    expiry: user.cardExpiry ?? '',
    cvc: '',
  };
};

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<User, 'id'>>) => Promise<void>;
}
