import { AuthGuard } from '@/components/auth/auth-guard';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>{children}</AuthGuard>
);

export default ProtectedLayout;
