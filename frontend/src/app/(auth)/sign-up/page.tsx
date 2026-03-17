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

export const metadata: Metadata = { title: 'Sign Up — TicketFlow' };

const SignUpPage = () => (
  <Card className="glass w-full max-w-sm border-white/40 shadow-md">
    <CardHeader className="text-center">
      <p className="mb-1 text-sm font-semibold text-primary">TicketFlow</p>
      <CardTitle className="text-xl">Create an account</CardTitle>
      <CardDescription>
        Join TicketFlow to buy and manage tickets
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form className="flex flex-col gap-4" action="#" method="post">
        <div className="grid grid-cols-2 gap-3">
          <Field.Root>
            <Field.Label className="mb-1.5 block text-sm font-medium text-foreground">
              First name
            </Field.Label>
            <Input placeholder="Jonas" autoComplete="given-name" />
          </Field.Root>

          <Field.Root>
            <Field.Label className="mb-1.5 block text-sm font-medium text-foreground">
              Last name
            </Field.Label>
            <Input placeholder="Jonaitis" autoComplete="family-name" />
          </Field.Root>
        </div>

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
          <Field.Label className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </Field.Label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label className="mb-1.5 block text-sm font-medium text-foreground">
            Confirm password
          </Field.Label>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field.Root>

        <Button type="submit" className="mt-1 w-full">
          Create account
        </Button>
      </form>
    </CardContent>

    <CardFooter className="justify-center text-sm text-muted-foreground">
      Already have an account?{' '}
      <Link
        href="/sign-in"
        className="ml-1 font-medium text-primary hover:underline"
      >
        Sign in
      </Link>
    </CardFooter>
  </Card>
);

export default SignUpPage;
