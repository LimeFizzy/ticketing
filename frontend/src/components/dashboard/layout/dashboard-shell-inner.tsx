'use client';

import { Menu } from 'lucide-react';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardMobileDrawer } from './dashboard-mobile-drawer';
import { useSidebar } from '@/hooks/use-sidebar';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export const DashboardShellInner = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { collapsed, openMobile } = useSidebar();
  const { user } = useAuth();

  return (
    <>
      <DashboardSidebar />
      <DashboardMobileDrawer />
      <main
        className={cn(
          'min-h-dvh transition-[padding] duration-300 ease-in-out',
          collapsed ? 'md:pl-20' : 'md:pl-64'
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/30 bg-card/70 px-4 backdrop-blur-xl md:hidden">
          <button
            type="button"
            onClick={openMobile}
            aria-label="Open navigation"
            className="relative flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display text-xl tracking-tight text-foreground">
            Dashboard
          </span>
          {user && (
            <span className="ml-auto truncate text-sm font-medium text-foreground">
              {user.firstName}
            </span>
          )}
        </header>

        {children}
      </main>
    </>
  );
};
