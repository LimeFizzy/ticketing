import { UserDto } from '@/lib/api';

export interface PaymentCard {
  cardholderName: string;
  number: string;
  expiry: string;
  cvc: string;
}

export interface User extends UserDto {
  card?: PaymentCard;
}

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
  updateProfile: (patch: Partial<Omit<User, 'id'>>) => void;
}
