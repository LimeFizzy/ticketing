'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Map, ScanLine, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DisclaimersCard } from '@/components/dashboard/events/disclaimers-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteEvent, updateEvent } from '@/lib/api';
import type { EventCategory, EventDto } from '@/lib/api/types.gen';
import {
  dashboardEventCheckInRoute,
  dashboardEventTicketsRoute,
  Route,
} from '@/lib/routes';
import { toDatetimeLocal } from '@/lib/formatters';
import { CoverImageField } from '@/components/dashboard/events/cover-image-field';
import { EventFormFields } from '@/components/dashboard/events/event-form-fields';
import { VenueCard } from '@/components/dashboard/events/venue-card';
import { EventTicketTypesCard } from '@/components/dashboard/events/event-ticket-types-card';
import { EventPromoCodesCard } from '@/components/dashboard/events/event-promo-codes-card';
import { EventPublishingCard } from '@/components/dashboard/events/event-publishing-card';
import { useAuth } from '@/hooks/use-auth';
import { useFormState } from '@/hooks/use-form-state';
import { useSaveFeedback } from '@/hooks/use-save-feedback';

type EventForm = {
  title: string;
  category: EventCategory;
  date: string;
  venue: string;
  city: string;
  description: string;
  imageUrl: string;
  status: 'published' | 'draft';
  disclaimers: string;
};

export const EditEventForm = ({ event: initialEvent }: { event: EventDto }) => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDto>(initialEvent);

  const [form, patch] = useFormState<EventForm>({
    title: initialEvent.title,
    category: initialEvent.category,
    date: toDatetimeLocal(initialEvent.date),
    venue: initialEvent.venue,
    city: initialEvent.city,
    description: initialEvent.description,
    imageUrl: initialEvent.imageUrl,
    status: initialEvent.status === 'published' ? 'published' : 'draft',
    disclaimers: initialEvent.disclaimers?.join('\n') ?? '',
  });

  const { saved, showSaved } = useSaveFeedback();
  const [saving, setSaving] = useState<'save' | 'publish' | 'unpublish' | null>(
    null
  );
  const [locationOpen, setLocationOpen] = useState(false);

  const persist = async (
    nextStatus: 'published' | 'draft',
    action: 'save' | 'publish' | 'unpublish'
  ) => {
    setSaving(action);
    const { data } = await updateEvent({
      path: { id },
      body: {
        title: form.title,
        category: form.category,
        date: new Date(form.date).toISOString(),
        venue: form.venue,
        city: form.city,
        imageUrl: form.imageUrl,
        description: form.description,
        featured: event?.featured ?? false,
        disclaimers: form.disclaimers.trim()
          ? form.disclaimers
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
              .join('|')
          : null,
        venueMapId: event?.venueMapId ?? null,
        status: nextStatus,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });

    if (data) {
      setEvent(data as EventDto);
      patch({ status: nextStatus });
      showSaved();
    }
    setSaving(null);
  };

  const handleSave = () => persist(form.status, 'save');
  const handlePublish = () => persist('published', 'publish');
  const handleUnpublish = () => persist('draft', 'unpublish');

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`))
      return;
    await deleteEvent({ path: { id } });
    router.push(Route.Dashboard);
  };

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
          <VenueCard
            venue={form.venue}
            city={form.city}
            event={event}
            ticketTypes={event.ticketTypes}
            onUpdate={(updated) => setEvent(updated)}
            open={locationOpen}
            onOpenChange={setLocationOpen}
          />
          <EventTicketTypesCard
            eventId={id}
            ticketTypes={event.ticketTypes}
            manageRoute={dashboardEventTicketsRoute(id)}
          />

          <EventPromoCodesCard eventId={id} />

          <DisclaimersCard
            value={form.disclaimers}
            onChange={(disclaimers) => patch({ disclaimers })}
          />

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

        <div className="flex flex-col gap-6 order-first lg:order-last lg:sticky lg:top-6 lg:self-start">
          <EventPublishingCard
            status={form.status}
            saved={saved}
            saving={saving}
            onSave={handleSave}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
          />
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => router.push(dashboardEventCheckInRoute(id))}
              >
                <ScanLine className="size-4" />
                Check in attendees
              </Button>
              {user?.role === 'admin' && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setLocationOpen(true)}
                >
                  <Map className="size-4" />
                  Edit venue map
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
