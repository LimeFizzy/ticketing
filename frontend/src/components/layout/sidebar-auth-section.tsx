'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface SidebarAuthSectionProps {
  collapsed?: boolean;
  onAfterSignOut?: () => void;
}

export const SidebarAuthSection = ({
  collapsed,
  onAfterSignOut,
}: SidebarAuthSectionProps) => {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    onAfterSignOut?.();
  };

  return (
    <>
      {!collapsed && (
        <div className="px-3 pb-1 text-xs text-sidebar-foreground/70">
          <p className="truncate font-medium text-sidebar-foreground">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate">{user.email}</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        title={collapsed ? 'Sign Out' : undefined}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        <LogOut className="size-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>
    </>
  );
};
