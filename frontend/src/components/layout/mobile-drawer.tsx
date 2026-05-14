'use client';

import Link from 'next/link';
import { Drawer } from '@base-ui/react/drawer';
import {
  BarChart2,
  CalendarDays,
  LayoutDashboard,
  Shield,
  Ticket,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { useAuth } from '@/hooks/use-auth';
import {
  dashboardAnalyticsRoute,
  dashboardVenueMapsRoute,
  Route,
} from '@/lib/routes';
import { NavLink } from './nav-link';
import { SidebarAuthSection } from './sidebar-auth-section';

export const MobileDrawer = () => {
  const { mobileOpen, openMobile, closeMobile } = useSidebar();
  const { isAuthenticated, user } = useAuth();

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
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border/60 px-4">
              <Link
                href={Route.Home}
                onClick={closeMobile}
                className="font-display text-xl tracking-tight text-sidebar-foreground"
              >
                TicketFlow
              </Link>
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

            <nav className="flex flex-col gap-1 px-2 py-3">
              <NavLink
                href={Route.Home}
                icon={<CalendarDays className="size-4" />}
                label="Events"
                onClick={closeMobile}
              />
              <NavLink
                href={Route.Tickets}
                icon={<Ticket className="size-4" />}
                label="My Tickets"
                onClick={closeMobile}
              />
              <NavLink
                href={Route.Account}
                icon={<User className="size-4" />}
                label="Account"
                onClick={closeMobile}
              />
              {user?.role === 'Organizer' && (
                <>
                  <NavLink
                    href={Route.Dashboard}
                    icon={<LayoutDashboard className="size-4" />}
                    label="Dashboard"
                    excludePrefixes={[dashboardAnalyticsRoute()]}
                    onClick={closeMobile}
                  />
                  <NavLink
                    href={dashboardAnalyticsRoute()}
                    icon={<BarChart2 className="size-4" />}
                    label="Analytics"
                    onClick={closeMobile}
                  />
                </>
              )}
              {user?.role === 'Admin' && (
                <>
                  <NavLink
                    href={Route.Dashboard}
                    icon={<LayoutDashboard className="size-4" />}
                    label="Dashboard"
                    excludePrefixes={[
                      dashboardAnalyticsRoute(),
                      dashboardVenueMapsRoute(),
                    ]}
                    onClick={closeMobile}
                  />
                  <NavLink
                    href={dashboardAnalyticsRoute()}
                    icon={<BarChart2 className="size-4" />}
                    label="Analytics"
                    onClick={closeMobile}
                  />
                  <NavLink
                    href={Route.Admin}
                    icon={<Shield className="size-4" />}
                    label="Admin"
                    onClick={closeMobile}
                  />
                </>
              )}
            </nav>

            {isAuthenticated && (
              <>
                <Separator className="bg-sidebar-border" />
                <div className="flex flex-col gap-1 px-2 py-3">
                  <SidebarAuthSection onAfterSignOut={closeMobile} />
                </div>
              </>
            )}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
