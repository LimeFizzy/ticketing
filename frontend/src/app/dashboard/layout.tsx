import { OrganizerGuard } from '@/components/auth/organizer-guard';
import { DashboardShell } from '@/components/dashboard/layout/dashboard-shell';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <OrganizerGuard>
    <DashboardShell>{children}</DashboardShell>
  </OrganizerGuard>
);

export default DashboardLayout;
