'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Route } from '@/lib/routes';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isHydrating } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isHydrating || isAuthenticated) return;
    const next = pathname ?? Route.Home;
    router.replace(`${Route.SignIn}?next=${encodeURIComponent(next)}`);
  }, [isHydrating, isAuthenticated, pathname, router]);

  if (isHydrating || !isAuthenticated) return null;
  return <>{children}</>;
};
