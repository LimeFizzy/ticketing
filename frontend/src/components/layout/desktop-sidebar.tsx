'use client';

import Link from 'next/link';
import {
  CalendarDays,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
  Ticket,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/hooks/use-sidebar';
import { NavLink } from './nav-link';
import { cn } from '@/lib/utils';

export const DesktopSidebar = () => {
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        'hidden md:flex fixed top-3 bottom-3 left-3 z-30 flex-col',
        'rounded-2xl border border-white/40 bg-sidebar/70 glass',
        'shadow-lg shadow-black/5 transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Top: logo + collapse toggle */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-sidebar-border/60 px-3',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!collapsed && (
          <span className="font-display text-xl tracking-tight text-sidebar-foreground">
            TicketFlow
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        <NavLink
          href="/"
          icon={<CalendarDays className="size-4" />}
          label="Events"
          collapsed={collapsed}
        />
        <NavLink
          href="/tickets"
          icon={<Ticket className="size-4" />}
          label="My Tickets"
          collapsed={collapsed}
        />
      </nav>

      <Separator className="bg-sidebar-border/60" />

      {/* Auth area */}
      <div className="space-y-2 px-2 py-3">
        <NavLink
          href="/sign-in"
          icon={<LogIn className="size-4" />}
          label="Sign In"
          collapsed={collapsed}
        />
        {!collapsed && (
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'w-full justify-center'
            )}
          >
            Sign Up
          </Link>
        )}
      </div>
    </aside>
  );
};
