import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
export const dynamic = 'force-dynamic';
import { CalendarDays, ChevronLeft, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EventPurchaseCard } from '@/components/events/event-purchase-card';
import { EventDisclaimers } from '@/components/events/event-disclaimers';
import { CATEGORY_COLORS } from '@/lib/event-styles';
import { formatEventDateLong, formatEventTime } from '@/lib/formatters';
import { Route } from '@/lib/routes';
import { getEventById } from '@/lib/api';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  const { data: event } = await getEventById({ path: { id } });
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
  const { data: event } = await getEventById({ path: { id } });
  if (!event) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <Link
        href={Route.Home}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to Events
      </Link>

      <h1 className="text-3xl font-bold leading-tight text-foreground lg:hidden">
        {event.title}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
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

          <EventPurchaseCard eventId={event.id} priceFrom={event.priceFrom} />
        </div>

        <div className="flex flex-col gap-4">
          <Card className="glass border-white/40 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-6">
              <h1 className="hidden text-3xl font-bold leading-tight text-foreground md:text-4xl lg:block">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4 shrink-0" />
                  {formatEventDateLong(event.date)} at{' '}
                  {formatEventTime(event.date)}
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

          <EventDisclaimers extras={event.disclaimers} />
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
