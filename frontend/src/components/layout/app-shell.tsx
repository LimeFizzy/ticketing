'use client';

import Link from 'next/link';
import { LogIn, Menu, User } from 'lucide-react';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { DesktopSidebar } from './desktop-sidebar';
import { MobileDrawer } from './mobile-drawer';
import { useSidebar } from '@/hooks/use-sidebar';
import { useAuth } from '@/hooks/use-auth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Route } from '@/lib/routes';

const ShellInner = ({ children }: { children: React.ReactNode }) => {
  const { collapsed, openMobile } = useSidebar();
  const { user } = useAuth();

  return (
    <>
      <DesktopSidebar />
      <MobileDrawer />
      <main
        className={cn(
          'min-h-dvh transition-[padding] duration-300 ease-in-out',
          collapsed ? 'md:pl-20' : 'md:pl-64'
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/30 bg-card/70 px-4 backdrop-blur-xl md:hidden">
          <button
            type="button"
            onClick={() => openMobile()}
            aria-label="Open navigation"
            className="relative flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-5" />
          </button>
          <Link
            href={Route.Home}
            className="font-display text-xl tracking-tight text-foreground"
          >
            TicketFlow
          </Link>
          {user ? (
            <Link
              href={Route.Account}
              className="ml-auto flex max-w-[50%] items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
            >
              <User className="size-4 shrink-0" />
              <span className="truncate">
                {user.firstName}
                {user.lastName ? ` ${user.lastName}` : ''}
              </span>
            </Link>
          ) : (
            <Link
              href={Route.SignIn}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'ml-auto gap-1.5'
              )}
            >
              <LogIn className="size-4" />
              Sign In
            </Link>
          )}
        </header>

        {children}
      </main>
    </>
  );
};

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <ShellInner>{children}</ShellInner>
  </SidebarProvider>
);
