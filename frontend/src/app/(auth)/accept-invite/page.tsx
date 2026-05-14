import { Suspense } from 'react';
import { AcceptInviteForm } from '@/components/auth/accept-invite-form';

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Suspense>
        <AcceptInviteForm />
      </Suspense>
    </div>
  );
}
