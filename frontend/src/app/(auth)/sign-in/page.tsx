'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Field } from '@base-ui/react/field';
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

const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isAuthenticated, isHydrating } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get('next') ?? Route.Home;

  useEffect(() => {
    if (!isHydrating && isAuthenticated) router.replace(next);
  }, [isHydrating, isAuthenticated, next, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setError(null);
    try {
      await signIn(email, password);
      router.replace(next);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'An error occurred during sign in.',
        { duration: Infinity }
      );
    }
  };

  return (
    <Card className="glass w-full max-w-sm border-white/40 shadow-md">
      <CardHeader className="text-center">
        <p className="mb-1 text-sm font-semibold text-primary">TicketFlow</p>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormField label="Email">
            <Input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>

          <Field.Root>
            <div className="mb-1.5 flex items-center justify-between">
              <Field.Label className="text-sm font-medium text-foreground">
                Password
              </Field.Label>
              <a href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field.Root>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-1 w-full">
            Sign In
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        No account yet?{' '}
        <Link
          href={`${Route.SignUp}${next !== Route.Home ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="ml-1 font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
};

const SignInPage = () => (
  <Suspense fallback={null}>
    <SignInForm />
  </Suspense>
);

export default SignInPage;
