'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Route } from '@/lib/routes';
import { AuthGuard } from './auth-guard';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') router.replace(Route.Home);
  }, [user, router]);

  return <AuthGuard>{user?.role === 'admin' ? children : null}</AuthGuard>;
};
