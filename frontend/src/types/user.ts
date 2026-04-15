import { UserDto } from '@/lib/api';

export type UserRole = 'attendee' | 'organizer';

export interface User extends UserDto {
  role: UserRole;
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
  updateProfile: (
    patch: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>
  ) => Promise<void>;
}
