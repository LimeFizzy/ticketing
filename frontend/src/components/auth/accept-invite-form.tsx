'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { acceptInvite, verifyInvite } from '@/lib/api';
import { Route } from '@/lib/routes';
import { useAuth } from '@/contexts/auth-context';
import { useFormState } from '@/hooks/use-form-state';

type InviteForm = {
  password: string;
  confirmPassword: string;
};

export const AcceptInviteForm = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [email, setEmail] = useState<string | null>(null);
  const [form, patch] = useFormState<InviteForm>({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Missing invite token');
      setVerifying(false);
      return;
    }

    verifyInvite({ body: { token } })
      .then(({ data }) => {
        if (data?.valid && data?.email) {
          setEmail(data.email);
        } else {
          setError('This invite link is invalid or has expired');
        }
      })
      .catch(() => setError('Failed to verify invite'))
      .finally(() => setVerifying(false));
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: apiError } = await acceptInvite({
      body: { token, password: form.password },
    });

    if (apiError) {
      setError(apiError?.title || 'Failed to accept invite');
      setLoading(false);
      return;
    }

    if (!email) {
      setError('Invite verification did not return an email');
      setLoading(false);
      return;
    }

    await signIn(email, form.password);
    router.replace(Route.Dashboard);
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Verifying invite…
        </CardContent>
      </Card>
    );
  }

  if (error && !email) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid Invite</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Set your password</CardTitle>
        <CardDescription>
          Welcome{email ? `, ${email}` : ''}! Set a password to activate your
          organizer account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {email && (
            <FormField label="Email">
              <Input value={email} disabled />
            </FormField>
          )}
          <FormField label="Password">
            <Input
              type="password"
              value={form.password}
              onChange={(e) => patch({ password: e.target.value })}
              placeholder="Min. 6 characters"
              required
            />
          </FormField>
          <FormField label="Confirm password">
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => patch({ confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              required
            />
          </FormField>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Activating…' : 'Activate account'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
