import Link from 'next/link';
import { type Metadata } from 'next';
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

export const metadata: Metadata = { title: 'Sign In — TicketFlow' };

const SignInPage = () => (
  <Card className="glass w-full max-w-sm border-white/40 shadow-md">
    <CardHeader className="text-center">
      <p className="mb-1 text-sm font-semibold text-primary">TicketFlow</p>
      <CardTitle className="text-xl">Welcome back</CardTitle>
      <CardDescription>Sign in to your account</CardDescription>
    </CardHeader>

    <CardContent>
      <form className="flex flex-col gap-4" action="#" method="post">
        <Field.Root>
          <Field.Label className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </Field.Label>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field.Root>

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
          />
        </Field.Root>

        <Button type="submit" className="mt-1 w-full">
          Sign In
        </Button>
      </form>
    </CardContent>

    <CardFooter className="justify-center text-sm text-muted-foreground">
      No account yet?{' '}
      <Link
        href="/sign-up"
        className="ml-1 font-medium text-primary hover:underline"
      >
        Sign up
      </Link>
    </CardFooter>
  </Card>
);

export default SignInPage;
