import Link from 'next/link';
import { CalendarDays, MapPin, QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatTicketDate } from '@/lib/formatters';
import { ticketRoute } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { type UserTicket } from '@/types/tickets';

interface TicketCardProps {
  ticket: UserTicket;
}

export const TicketCard = ({ ticket }: TicketCardProps) => {
  return (
    <Link href={ticketRoute(ticket.id)} className="block focus:outline-none">
      <Card
        className={cn(
          'glass border-white/40 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
          ticket.isPast && 'grayscale opacity-60'
        )}
      >
        <CardContent className="flex gap-4 p-4">
          <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 text-muted-foreground">
            <QrCode className="size-8" />
            <span className="mt-1 text-[10px] font-medium">QR Code</span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h3 className="truncate font-semibold text-foreground">
              {ticket.eventTitle}
            </h3>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3 shrink-0" />
                {formatTicketDate(ticket.eventDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{ticket.venue}</span>
              </span>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground/70">
              #{ticket.ticketCode}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
