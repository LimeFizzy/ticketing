import { type Metadata } from 'next';
import { Field } from '@base-ui/react/field';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PROFILE } from '@/lib/mock-data';

export const metadata: Metadata = { title: 'Account — TicketFlow' };

const AccountPage = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <h1 className="text-2xl font-semibold text-foreground">Account</h1>

    {/* Avatar + summary */}
    <Card className="glass border-white/40 shadow-sm">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/15">
          <User className="size-8 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {PROFILE.firstName} {PROFILE.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{PROFILE.email}</p>
        </div>
      </CardContent>
    </Card>

    {/* Edit form */}
    <Card className="glass border-white/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Profile details</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field.Root>
            <Field.Label className="mb-1.5 block text-sm font-medium text-foreground">
              First name
            </Field.Label>
            <Input defaultValue={PROFILE.firstName} />
          </Field.Root>

          <Field.Root>
            <Field.Label className="mb-1.5 block text-sm font-medium text-foreground">
              Last name
            </Field.Label>
            <Input defaultValue={PROFILE.lastName} />
          </Field.Root>

          <Field.Root className="sm:col-span-2">
            <Field.Label className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </Field.Label>
            <Input type="email" defaultValue={PROFILE.email} />
          </Field.Root>

          <div className="sm:col-span-2">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default AccountPage;
