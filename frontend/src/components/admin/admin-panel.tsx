'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { toast } from 'sonner';
import { getOrganizers, inviteOrganizer, removeOrganizer } from '@/lib/api';
import { extractApiError } from '@/lib/api-error';
import type { OrganizerDto } from '@/lib/api/types.gen';
import { useFormState } from '@/hooks/use-form-state';

type InviteForm = {
  firstName: string;
  lastName: string;
  email: string;
};

export const AdminPanel = () => {
  const [organizers, setOrganizers] = useState<OrganizerDto[]>([]);
  const [form, patch] = useFormState<InviteForm>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchOrganizers = async () => {
    const { data } = await getOrganizers();
    if (data) setOrganizers(data as OrganizerDto[]);
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleInvite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error: apiError } = await inviteOrganizer({
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      },
    });

    if (apiError) {
      toast.error(extractApiError(apiError), { duration: Infinity });
      setLoading(false);
      return;
    }

    await fetchOrganizers();
    setLoading(false);
  };

  const handleRemove = async (id: string) => {
    const { error } = await removeOrganizer({ path: { id } });
    if (error) {
      toast.error(extractApiError(error), { duration: Infinity });
      return;
    }
    await fetchOrganizers();
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="font-display text-2xl tracking-tight">Admin Panel</h1>

      <Card>
        <CardHeader>
          <CardTitle>Invite Organizer</CardTitle>
          <CardDescription>
            Create an organizer account. They will receive a link to set their
            password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleInvite}>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First name">
                <Input
                  value={form.firstName}
                  onChange={(e) => patch({ firstName: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Last name">
                <Input
                  value={form.lastName}
                  onChange={(e) => patch({ lastName: e.target.value })}
                  required
                />
              </FormField>
            </div>
            <FormField label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => patch({ email: e.target.value })}
                required
              />
            </FormField>
            <Button type="submit" disabled={loading}>
              {loading ? 'Inviting…' : 'Send Invite'}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organizers</CardTitle>
        </CardHeader>
        <CardContent>
          {organizers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No organizers invited yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {organizers.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {o.firstName} {o.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{o.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        o.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {o.isActive ? 'Active' : 'Pending'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(o.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
