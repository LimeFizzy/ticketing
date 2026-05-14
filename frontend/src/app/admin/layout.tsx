import { AdminGuard } from '@/components/auth/admin-guard';
import { AppShell } from '@/components/layout/app-shell';

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <AdminGuard>
    <AppShell>{children}</AppShell>
  </AdminGuard>
);

export default AdminLayout;
