import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import { TicketTypeSelector } from '@/components/buy/ticket-type-selector';
import { VenueMapSelector } from '@/components/buy/venue-map-selector';
import { eventRoute } from '@/lib/routes';
import {
  getEventById,
  getEventVenueMap,
  getEventVenueMapPlaces,
} from '@/lib/api';
import type { VenueMap } from '@/types/venue-map';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  const { data: event } = await getEventById({ path: { id } });
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
  const { data: event } = await getEventById({ path: { id } });
  if (!event) notFound();

  let venueMapWithTicketTypes: VenueMap | undefined;

  if (event.venueMapId) {
    const [mapRes, mappingsRes] = await Promise.all([
      getEventVenueMap({ path: { id: event.id } }),
      getEventVenueMapPlaces({ path: { eventId: event.id } }),
    ]);

    if (mapRes.data && mappingsRes.data) {
      const mappingByPlaceId = new Map(
        mappingsRes.data.map((m) => [m.venueMapPlaceId, m.eventTicketTypeId])
      );

      venueMapWithTicketTypes = {
        id: mapRes.data.id,
        name: mapRes.data.name,
        width: mapRes.data.width,
        height: mapRes.data.height,
        decorations: mapRes.data.decorations.map((d) => ({
          id: d.id,
          x: d.x,
          y: d.y,
          width: d.width,
          height: d.height,
          label: d.label,
        })),
        places: mapRes.data.places.map((p) => ({
          id: p.id,
          kind: p.kind as 'seat' | 'section',
          label: p.label,
          x: p.x,
          y: p.y,
          width: p.width ?? undefined,
          height: p.height ?? undefined,
          capacity: p.capacity,
          available: p.available,
          ticketTypeId: mappingByPlaceId.get(p.id) ?? '',
        })),
      };
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
      <Link
        href={eventRoute(event.id)}
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

      {venueMapWithTicketTypes ? (
        <VenueMapSelector event={event} venueMap={venueMapWithTicketTypes} />
      ) : (
        <TicketTypeSelector event={event} />
      )}
    </div>
  );
};

export default BuyTicketsPage;
