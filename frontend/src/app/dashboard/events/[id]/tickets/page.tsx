'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { TicketTypesList } from '@/components/dashboard/tickets/ticket-types-list';
import { getEventById } from '@/lib/api';
import type { EventDto, OrganizerEventTicketTypeDto } from '@/lib/api/types.gen';
import { dashboardEventRoute, dashboardEventTicketRoute } from '@/lib/routes';

const EventTicketsPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<EventDto | null>(null);
  const [ticketTypes, setTicketTypes] = useState<OrganizerEventTicketTypeDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getEventById({ path: { id } })
      .then(({ data }) => {
        if (!active) return;
        setEvent(data ?? null);
        setTicketTypes((data?.ticketTypes ?? []) as OrganizerEventTicketTypeDto[]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleEdit = useCallback(
    (ticketId: string) => {
      router.push(dashboardEventTicketRoute(id, ticketId));
    },
    [id, router]
  );

  if (loading) return null;
  if (!event) notFound();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <Link
        href={dashboardEventRoute(id)}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {event.title}
      </Link>

      <h1 className="font-display text-3xl tracking-tight text-foreground">
        Ticket Types
      </h1>

      <TicketTypesList
        eventId={id}
        ticketTypes={ticketTypes}
        onChange={setTicketTypes}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default EventTicketsPage;
