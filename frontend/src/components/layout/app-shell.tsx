'use client';

import { Menu } from 'lucide-react';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { DesktopSidebar } from './desktop-sidebar';
import { MobileDrawer } from './mobile-drawer';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';

const ShellInner = ({ children }: { children: React.ReactNode }) => {
  const { collapsed, openMobile } = useSidebar();
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
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/30 bg-card/70 px-4 backdrop-blur-xl md:hidden">
          <button
            type="button"
            onClick={() => openMobile()}
            aria-label="Open navigation"
            className="relative flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display text-xl tracking-tight text-foreground">
            TicketFlow
          </span>
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
