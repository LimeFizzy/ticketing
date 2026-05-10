import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import { TicketTypeSelector } from '@/components/buy/ticket-type-selector';
import { VenueMapSelector } from '@/components/buy/venue-map-selector';
import { EVENTS } from '@/lib/mock-data';
import { getVenueMap } from '@/lib/venue-maps';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === id);
  return {
    title: event
      ? `Select tickets — ${event.title} — TicketFlow`
      : 'Select tickets — TicketFlow',
  };
};

const BuyTicketsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === id);
  if (!event) notFound();

  const venueMap = event.venueMapId ? getVenueMap(event.venueMapId) : undefined;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
      <Link
        href={`/events/${event.id}`}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to event
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
          Select tickets
        </h1>
        <p className="text-sm text-muted-foreground">{event.title}</p>
      </div>

      {venueMap ? (
        <VenueMapSelector event={event} venueMap={venueMap} />
      ) : (
        <TicketTypeSelector event={event} />
      )}
    </div>
  );
};

export default BuyTicketsPage;
