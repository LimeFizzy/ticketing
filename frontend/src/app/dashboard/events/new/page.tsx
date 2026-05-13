'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type EventCategory,
  createOrganizerEvent,
} from '@/lib/mocks/dashboard';
import { dashboardEventRoute, Route } from '@/lib/routes';
import { CoverImageField } from '@/components/dashboard/events/cover-image-field';
import { EventFormFields } from '@/components/dashboard/events/event-form-fields';
import { useFormState } from '@/hooks/use-form-state';
import { newId } from '@/lib/utils';

type EventForm = {
  title: string;
  category: EventCategory;
  date: string;
  venue: string;
  city: string;
  description: string;
  imageUrl: string;
  status: 'published' | 'draft';
};

const INITIAL_FORM: EventForm = {
  title: '',
  category: 'Music',
  date: '',
  venue: '',
  city: '',
  description: '',
  imageUrl: '',
  status: 'draft',
};

const NewEventPage = () => {
  const router = useRouter();
  const [form, patch] = useFormState<EventForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = useCallback(() => {
    if (
      !form.title.trim() ||
      !form.date ||
      !form.venue.trim() ||
      !form.city.trim()
    )
      return;
    setSubmitting(true);
    const event = { id: newId(), ...form, ticketTypes: [] };
    createOrganizerEvent(event);
    router.push(dashboardEventRoute(event.id));
  }, [form, router]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <Link
        href={Route.Dashboard}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        My Events
      </Link>

      <h1 className="mb-6 font-display text-3xl tracking-tight text-foreground">
        New Event
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <EventFormFields form={form} patch={patch} />
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <Card className="glass border-white/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-6 pt-0">
              <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2.5">
                {form.status === 'published' ? (
                  <Globe className="size-4 shrink-0 text-primary" />
                ) : (
                  <Lock className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {form.status === 'published' ? 'Published' : 'Draft'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.status === 'published'
                      ? 'Visible to the public after creation'
                      : 'Save first, publish when ready'}
                  </p>
                </div>
              </div>

              <Select
                value={form.status}
                onValueChange={(v) =>
                  patch({ status: v as 'published' | 'draft' })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {() =>
                      form.status === 'published' ? 'Published' : 'Draft'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={
                  submitting ||
                  !form.title.trim() ||
                  !form.date ||
                  !form.venue.trim() ||
                  !form.city.trim()
                }
              >
                {submitting ? 'Creating…' : 'Create event'}
              </Button>
            </CardContent>
          </Card>

          <CoverImageField
            value={form.imageUrl}
            onChange={(imageUrl) => patch({ imageUrl })}
          />
        </div>
      </div>
    </div>
  );
};

export default NewEventPage;
