import { AppShell } from '@/components/layout/app-shell';

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <AppShell>{children}</AppShell>
);

export default AppLayout;
