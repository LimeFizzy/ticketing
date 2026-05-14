import { AdminGuard } from '@/components/auth/admin-guard';
import { AdminPanel } from '@/components/admin/admin-panel';

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminPanel />
    </AdminGuard>
  );
}
