'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Route } from '@/lib/routes';

interface NavLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
  excludePrefixes?: string[];
}

export const NavLink = ({
  href,
  icon,
  label,
  collapsed = false,
  onClick,
  excludePrefixes,
}: NavLinkProps) => {
  const pathname = usePathname();
  const isActive =
    (pathname === href || (href !== Route.Home && pathname.startsWith(href))) &&
    !excludePrefixes?.some((prefix) => pathname.startsWith(prefix));

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
};
