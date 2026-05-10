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
    <div className="relative h-screen overflow-hidden">
      <DesktopSidebar />
      <MobileDrawer />
      <main
        className={cn(
          'h-full overflow-y-auto transition-[padding] duration-300 ease-in-out',
          collapsed ? 'md:pl-20' : 'md:pl-64'
        )}
      >
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/30 bg-card/70 px-4 backdrop-blur-xl md:hidden">
          <button
            onClick={openMobile}
            aria-label="Open navigation"
            className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display text-xl tracking-tight text-foreground">
            TicketFlow
          </span>
        </header>

        {children}
      </main>
    </div>
  );
};

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <ShellInner>{children}</ShellInner>
  </SidebarProvider>
);
