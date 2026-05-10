'use client';

import Link from 'next/link';
import { Drawer } from '@base-ui/react/drawer';
import { CalendarDays, LogIn, Ticket, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { NavLink } from './nav-link';

export const MobileDrawer = () => {
  const { mobileOpen, openMobile, closeMobile } = useSidebar();

  return (
    <Drawer.Root
      open={mobileOpen}
      onOpenChange={(open) => (open ? openMobile() : closeMobile())}
      modal
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
        <Drawer.Viewport>
        <Drawer.Popup
          className={cn(
            'fixed inset-x-3 top-3 z-50 flex flex-col overflow-hidden rounded-2xl border border-white/40 bg-sidebar/85 glass shadow-xl',
            'data-[starting-style]:-translate-y-[110%] data-[ending-style]:-translate-y-[110%] transition-transform duration-300 ease-out'
          )}
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-sidebar-border/60 px-4">
            <span className="font-display text-xl tracking-tight text-sidebar-foreground">
              TicketFlow
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={closeMobile}
              aria-label="Close navigation"
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 px-2 py-3">
            <NavLink
              href="/"
              icon={<CalendarDays className="size-4" />}
              label="Events"
              onClick={closeMobile}
            />
            <NavLink
              href="/tickets"
              icon={<Ticket className="size-4" />}
              label="My Tickets"
              onClick={closeMobile}
            />
          </nav>

          <Separator className="bg-sidebar-border" />

          {/* Auth */}
          <div className="flex flex-col gap-2 px-2 py-3">
            <NavLink
              href="/sign-in"
              icon={<LogIn className="size-4" />}
              label="Sign In"
              onClick={closeMobile}
            />
            <Link
              href="/sign-up"
              onClick={closeMobile}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'w-full justify-center'
              )}
            >
              Sign Up
            </Link>
          </div>
        </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
