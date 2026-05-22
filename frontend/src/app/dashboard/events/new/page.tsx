'use client';

import { useState } from 'react';
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
import type { EventCategory, EventStatus } from '@/lib/api/types.gen';
import { createEvent } from '@/lib/api';
import { dashboardEventRoute, Route } from '@/lib/routes';
import { CoverImageField } from '@/components/dashboard/events/cover-image-field';
import { EventFormFields } from '@/components/dashboard/events/event-form-fields';
import { useFormState } from '@/hooks/use-form-state';

type EventForm = {
  title: string;
  category: EventCategory;
  date: string;
  venue: string;
  city: string;
  description: string;
  imageUrl: string;
  status: EventStatus;
};

const INITIAL_FORM: EventForm = {
  title: '',
  category: 'Music',
  date: '',
  venue: '',
  city: '',
  description: '',
  imageUrl: '',
  status: 'Draft',
};

type FieldErrors = Partial<Record<'title' | 'date' | 'venue' | 'city', string>>;

const validate = (form: EventForm): FieldErrors => {
  const errors: FieldErrors = {};
  if (!form.title.trim()) errors.title = 'Title is required';
  if (!form.date) errors.date = 'Date is required';
  if (!form.venue.trim()) errors.venue = 'Location is required';
  if (!form.city.trim()) errors.city = 'City is required';
  return errors;
};

const NewEventPage = () => {
  const router = useRouter();
  const [form, patch] = useFormState<EventForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const patchAndClearError = (values: Partial<EventForm>) => {
    patch(values);
    const clearedKeys = Object.keys(values) as (keyof FieldErrors)[];
    setErrors((prev) => {
      const next = { ...prev };
      clearedKeys.forEach((k) => delete next[k]);
      return next;
    });
  };

  const handleCreate = async () => {
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setApiError(null);

    const { data, error } = await createEvent({
      body: {
        title: form.title.trim(),
        category: form.category,
        date: new Date(form.date).toISOString(),
        venue: form.venue.trim(),
        city: form.city.trim(),
        imageUrl: form.imageUrl || undefined,
        description: form.description || undefined,
        status: form.status,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });

    if (error) {
      setApiError(
        typeof error === 'object' && 'title' in error
          ? String(error.title)
          : 'Failed to create event'
      );
      setSubmitting(false);
      return;
    }

    if (data) {
      router.push(dashboardEventRoute(data.id));
    } else {
      setSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

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
          <EventFormFields
            form={form}
            patch={patchAndClearError}
            errors={errors}
          />
        </div>

        <div className="flex flex-col gap-6 order-first lg:order-last lg:sticky lg:top-6 lg:self-start">
          <Card className="glass border-white/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-6 pt-0">
              <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2.5">
                {form.status === 'Published' ? (
                  <Globe className="size-4 shrink-0 text-primary" />
                ) : (
                  <Lock className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {form.status === 'Published' ? 'Published' : 'Draft'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.status === 'Published'
                      ? 'Visible to the public after creation'
                      : 'Save first, publish when ready'}
                  </p>
                </div>
              </div>

              <Select
                value={form.status}
                onValueChange={(v) =>
                  patch({ status: v as 'Published' | 'Draft' })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {() =>
                      form.status === 'Published' ? 'Published' : 'Draft'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>

              {apiError && (
                <p className="text-sm text-destructive">{apiError}</p>
              )}

              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting
                  ? 'Creating…'
                  : hasErrors
                    ? 'Fix errors above'
                    : 'Create event'}
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
