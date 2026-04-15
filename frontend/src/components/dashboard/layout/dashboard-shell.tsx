'use client';

import { SidebarProvider } from '@/contexts/sidebar-context';
import { DashboardShellInner } from './dashboard-shell-inner';

export const DashboardShell = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <DashboardShellInner>{children}</DashboardShellInner>
  </SidebarProvider>
);
