'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import {
  Check,
  ChevronLeft,
  Globe,
  LayoutGrid,
  Lock,
  MapPin,
  Ticket,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  type EventCategory,
  deleteOrganizerEvent,
  getOrganizerEvent,
  updateOrganizerEvent,
} from '@/lib/mocks/dashboard';
import { dashboardEventTicketsRoute, Route } from '@/lib/routes';
import { toDatetimeLocal } from '@/lib/formatters';
import { CoverImageField } from '@/components/dashboard/events/cover-image-field';
import { EventFormFields } from '@/components/dashboard/events/event-form-fields';
import { useFormState } from '@/hooks/use-form-state';
import { useSaveFeedback } from '@/hooks/use-save-feedback';
import { cn } from '@/lib/utils';

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

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event] = useState(() => getOrganizerEvent(id) ?? null);

  const [form, patch] = useFormState<EventForm>({
    title: event?.title ?? '',
    category: event?.category ?? 'Music',
    date: event ? toDatetimeLocal(event.date) : '',
    venue: event?.venue ?? '',
    city: event?.city ?? '',
    description: event?.description ?? '',
    imageUrl: event?.imageUrl ?? '',
    status: event?.status ?? 'draft',
  });

  const { saved, showSaved } = useSaveFeedback();

  if (!event) notFound();

  const persist = useCallback(
    (nextStatus: 'published' | 'draft') => {
      updateOrganizerEvent(id, {
        ...form,
        status: nextStatus,
        ticketTypes: event!.ticketTypes,
      });
      patch({ status: nextStatus });
      showSaved();
    },
    [id, form, event, patch, showSaved]
  );

  const handleSave = useCallback(
    () => persist(form.status),
    [persist, form.status]
  );
  const handlePublish = useCallback(() => persist('published'), [persist]);
  const handleUnpublish = useCallback(() => persist('draft'), [persist]);

  const handleDelete = useCallback(() => {
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`))
      return;
    deleteOrganizerEvent(id);
    router.push(Route.Dashboard);
  }, [id, form.title, router]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <Link
        href={Route.Dashboard}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        My Events
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="min-w-0 flex-1 truncate font-display text-3xl tracking-tight text-foreground">
          {form.title || 'Untitled event'}
        </h1>
        <Badge
          variant={form.status === 'published' ? 'default' : 'secondary'}
          className="shrink-0 capitalize"
        >
          {form.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <EventFormFields form={form} patch={patch} />

          <Card className="glass border-white/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Venue
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-normal">
                Coming soon
              </Badge>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex gap-4 rounded-lg border border-border bg-muted/20 p-4">
                <div className="shrink-0 rounded-lg border border-dashed border-border bg-muted/30 p-3">
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="size-1.5 rounded-sm bg-muted-foreground/25"
                      />
                    ))}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {form.venue || '—'}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {form.city || '—'}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/60">
                    <LayoutGrid className="size-3" />
                    <span>Seating map not configured</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  Configure seating zones, seat-level assignment, and section
                  capacity.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  disabled
                >
                  <MapPin className="size-3.5" />
                  Manage venue
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ticket Types
              </CardTitle>
              <Link
                href={dashboardEventTicketsRoute(id)}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'gap-1.5'
                )}
              >
                <Ticket className="size-3.5" />
                Manage
              </Link>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {event!.ticketTypes.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
                  <Ticket className="size-8 text-muted-foreground/40" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      No ticket types yet
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Add ticket types so attendees can purchase tickets.
                    </p>
                  </div>
                  <Link
                    href={dashboardEventTicketsRoute(id)}
                    className={buttonVariants({ size: 'sm' })}
                  >
                    Add ticket types
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {event!.ticketTypes.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {t.name}
                        </p>
                        {t.description && (
                          <p className="truncate text-xs text-muted-foreground">
                            {t.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          €{t.price}
                        </span>
                        <span className="tabular-nums text-xs text-muted-foreground">
                          {t.sold} / {t.capacity} sold
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-destructive">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 p-6 pt-0">
              <p className="text-sm text-muted-foreground">
                Permanently delete this event and all its ticket types.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={handleDelete}
              >
                <Trash2 className="size-3.5" />
                Delete event
              </Button>
            </CardContent>
          </Card>
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
                      ? 'Visible to the public'
                      : 'Not visible to the public'}
                  </p>
                </div>
              </div>

              <Button className="w-full gap-1.5" onClick={handleSave}>
                {saved ? <Check className="size-4" /> : null}
                {saved ? 'Saved' : 'Save changes'}
              </Button>

              {form.status === 'draft' ? (
                <Button
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={handlePublish}
                >
                  <Globe className="size-4" />
                  Publish event
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={handleUnpublish}
                >
                  <Lock className="size-4" />
                  Unpublish
                </Button>
              )}
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

export default EditEventPage;
