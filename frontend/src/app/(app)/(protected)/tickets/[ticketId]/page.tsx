import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import { cookies } from 'next/headers';
import { CalendarDays, ChevronLeft, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TicketQR } from '@/components/tickets/ticket-qr';
import { formatEventDateLong, formatEventTime } from '@/lib/formatters';
import { getTicketById } from '@/lib/api';
import { Route } from '@/lib/routes';

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
  const cookieStore = await cookies();
  const { data: ticket, error } = await getTicketById({
    path: { id: ticketId },
    headers: { Cookie: cookieStore.toString() },
  });
  if (error || !ticket) notFound();

  const isPast = new Date(ticket.eventDate) < new Date();

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
              {ticket.eventTitle}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4 shrink-0" />
              {formatEventDateLong(ticket.eventDate)} ·{' '}
              {formatEventTime(ticket.eventDate)}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              {ticket.venue}, {ticket.city}
            </p>
          </div>

          <TicketQR
            ticketCode={ticket.ticketCode}
            eventId={ticket.eventId}
            checkedInAt={ticket.checkedInAt}
            muted={isPast}
          />

          <p className="font-mono text-sm text-muted-foreground">
            #{ticket.ticketCode}
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
