import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import { CalendarDays, ChevronLeft, MapPin, Ticket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EVENTS } from '@/lib/mock-data';
import { CATEGORY_COLORS } from '@/lib/event-styles';
import {
  formatEventDateLong,
  formatEventTime,
} from '@/lib/formatters';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === id);
  return {
    title: event ? `${event.title} — TicketFlow` : 'Event — TicketFlow',
  };
};

const EventDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === id);
  if (!event) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      {/* Back */}
      <Link
        href="/"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to Events
      </Link>

      {/* Hero */}
      <div className="relative aspect-video overflow-hidden rounded-2xl">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <Badge
          className={`absolute left-4 top-4 border text-xs font-medium ${CATEGORY_COLORS[event.category]}`}
        >
          {event.category}
        </Badge>
      </div>

      {/* Info card */}
      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6">
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0" />
              {formatEventDateLong(event.date)} at {formatEventTime(event.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" />
              {event.venue}, {event.city}
            </span>
          </div>

          <Separator />

          <p className="leading-relaxed text-foreground/80">
            {event.description}
          </p>

          <div className="text-sm text-muted-foreground">
            {event.availableTickets.toLocaleString()} tickets remaining
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="glass sticky bottom-6 border-white/50">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="text-2xl font-bold text-primary">
              {event.price === 0 ? 'Free' : `€${event.price}`}
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Ticket className="size-4" />
            Buy Ticket
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetailPage;
