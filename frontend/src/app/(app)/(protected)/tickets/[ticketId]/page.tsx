import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import { CalendarDays, ChevronLeft, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TicketQR } from '@/components/tickets/ticket-qr';
import { getUserTicketById } from '@/lib/tickets';
import { formatEventDateLong, formatEventTime } from '@/lib/formatters';
import { Route } from '@/lib/routes';
import { getEvents } from '@/lib/api';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}): Promise<Metadata> => {
  const { ticketId } = await params;
  return { title: `Ticket #${ticketId} — TicketFlow` };
};

const TicketDetailPage = async ({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) => {
  const { ticketId } = await params;
  const { data } = await getEvents();
  const ticket = getUserTicketById((data || []), new Date(), ticketId);
  if (!ticket) notFound();

  const { event, isPast } = ticket;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <Link
        href={Route.Tickets}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to tickets
      </Link>

      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-display text-3xl leading-tight text-foreground">
              {event.title}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" />
              {formatEventDateLong(event.date)} · {formatEventTime(event.date)}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {event.venue}, {event.city}
            </p>
          </div>

          <TicketQR
            ticketId={ticket.ticketId}
            eventId={event.id}
            muted={isPast}
          />

          <p className="font-mono text-sm text-muted-foreground">
            #{ticket.ticketId}
          </p>
          <p className="max-w-sm text-center text-xs text-muted-foreground">
            Show this code at the entrance for check-in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketDetailPage;
