'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { TicketTypesList } from '@/components/dashboard/tickets/ticket-types-list';
import {
  getOrganizerEvent,
  type OrganizerTicketType,
  updateOrganizerEvent,
} from '@/lib/mocks/dashboard';
import { dashboardEventRoute, dashboardEventTicketRoute } from '@/lib/routes';

const EventTicketsPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event] = useState(() => getOrganizerEvent(id) ?? null);
  const [ticketTypes, setTicketTypes] = useState<OrganizerTicketType[]>(
    event?.ticketTypes ?? []
  );

  const handleChange = useCallback(
    (updated: OrganizerTicketType[]) => {
      setTicketTypes(updated);
      updateOrganizerEvent(id, { ...event!, ticketTypes: updated });
    },
    [id, event]
  );

  const handleEdit = useCallback(
    (ticketId: string) => {
      router.push(dashboardEventTicketRoute(id, ticketId));
    },
    [id, router]
  );

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
        ticketTypes={ticketTypes}
        onChange={handleChange}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default EventTicketsPage;
