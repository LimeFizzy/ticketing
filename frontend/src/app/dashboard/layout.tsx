import { OrganizerGuard } from '@/components/auth/organizer-guard';
import { AppShell } from '@/components/layout/app-shell';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <OrganizerGuard>
    <AppShell>{children}</AppShell>
  </OrganizerGuard>
);

export default DashboardLayout;
