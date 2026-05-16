import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/api';
import type { OrganizerEventTicketTypeDto } from '@/lib/api/types.gen';
import { EventTicketsContent } from '@/components/dashboard/tickets/event-tickets-content';

const EventTicketsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const cookieStore = await cookies();
  const { data: event } = await getEventById({
    path: { id },
    headers: { Cookie: cookieStore.toString() },
  });

  if (!event) notFound();

  const ticketTypes = (event.ticketTypes ??
    []) as OrganizerEventTicketTypeDto[];

  return <EventTicketsContent event={event} ticketTypes={ticketTypes} />;
};

export default EventTicketsPage;
