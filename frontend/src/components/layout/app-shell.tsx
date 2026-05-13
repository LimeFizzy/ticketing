'use client';

import { SidebarProvider } from '@/contexts/sidebar-context';
import { AppShellInner } from './app-shell-inner';

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <AppShellInner>{children}</AppShellInner>
  </SidebarProvider>
);
