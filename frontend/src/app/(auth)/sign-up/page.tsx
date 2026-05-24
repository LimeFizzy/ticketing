'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
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
import { useAuth } from '@/hooks/use-auth';
import { Route } from '@/lib/routes';

const SignUpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, isAuthenticated, isHydrating } = useAuth();

  const next = searchParams.get('next') ?? Route.Home;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrating && isAuthenticated) router.replace(next);
  }, [isHydrating, isAuthenticated, next, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('All fields are required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    try {
      await signUp({ firstName, lastName, email, password });
      router.replace(next);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'An error occurred during registration.',
        { duration: Infinity }
      );
    }
  };

  return (
    <Card className="glass w-full max-w-sm border-white/40 shadow-md">
      <CardHeader className="text-center">
        <p className="mb-1 text-sm font-semibold text-primary">TicketFlow</p>
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Join TicketFlow to buy and manage tickets
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name">
              <Input
                placeholder="Jonas"
                autoComplete="given-name"
                maxLength={100}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </FormField>

            <FormField label="Last name">
              <Input
                placeholder="Jonaitis"
                autoComplete="family-name"
                maxLength={100}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Email">
            <Input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={256}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>

          <FormField label="Password">
            <Input
              type="password"
              placeholder="Min. 8 chars, upper + lower + digit"
              autoComplete="new-password"
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>

          <FormField label="Confirm password">
            <Input
              type="password"
              placeholder="Re-enter password"
              autoComplete="new-password"
              maxLength={128}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </FormField>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-1 w-full">
            Create account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={`${Route.SignIn}${next !== Route.Home ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="ml-1 font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
};

const SignUpPage = () => (
  <Suspense fallback={null}>
    <SignUpForm />
  </Suspense>
);

export default SignUpPage;
