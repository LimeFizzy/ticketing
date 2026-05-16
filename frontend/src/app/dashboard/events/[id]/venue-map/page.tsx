'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getEventById,
  getVenueMaps,
  getManagedEventVenueMapPlaces,
  setEventVenueMapPlaces,
  updateEvent,
  getVenueMapById,
} from '@/lib/api';
import { useSaveFeedback } from '@/hooks/use-save-feedback';
import { dashboardEventRoute } from '@/lib/routes';
import type {
  EventDto,
  VenueMapSummaryDto,
  VenueMapDto,
  EventVenueMapPlaceDto,
} from '@/lib/api/types.gen';

export default function EventVenueMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { saved, showSaved } = useSaveFeedback();
  const [eventId, setEventId] = useState<string>('');
  const [event, setEvent] = useState<EventDto | null>(null);
  const [allMaps, setAllMaps] = useState<VenueMapSummaryDto[]>([]);
  const [selectedMap, setSelectedMap] = useState<VenueMapDto | null>(null);
  const [mappings, setMappings] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      setEventId(id);
      Promise.all([getEventById({ path: { id } }), getVenueMaps()]).then(
        ([eventRes, mapsRes]) => {
          if (eventRes.data) setEvent(eventRes.data);
          if (mapsRes.data) setAllMaps(mapsRes.data as VenueMapSummaryDto[]);
        }
      );
    });
  }, [params]);

  useEffect(() => {
    if (!eventId) return;
    getManagedEventVenueMapPlaces({ path: { eventId } })
      .then(({ data }) => {
        if (data) {
          const map = new Map<string, string>();
          (data as EventVenueMapPlaceDto[]).forEach((m) => {
            if (m.venueMapPlaceId && m.eventTicketTypeId)
              map.set(m.venueMapPlaceId, m.eventTicketTypeId);
          });
          setMappings(map);
        }
      })
      .catch(() => {});
  }, [eventId]);

  const handleSelectMap = async (mapId: string) => {
    if (!eventId) return;
    const { data: updated } = await updateEvent({
      path: { id: eventId },
      body: {
        title: event!.title,
        category: event!.category,
        date: event!.date,
        venue: event!.venue,
        city: event!.city,
        featured: event!.featured,
        status: event!.status,
        venueMapId: mapId === '__none__' ? null : mapId,
      },
    });
    if (updated) {
      setEvent(updated);
      if (mapId !== '__none__') {
        const { data } = await getVenueMapById({ path: { id: mapId } });
        if (data) setSelectedMap(data);
      } else {
        setSelectedMap(null);
      }
    }
  };

  // Load full map when event has a venueMapId
  useEffect(() => {
    if (event?.venueMapId) {
      getVenueMapById({ path: { id: event.venueMapId! } }).then(({ data }) => {
        if (data) setSelectedMap(data);
      });
    }
  }, [event?.venueMapId]);

  const updateMapping = (placeId: string, ticketTypeId: string) => {
    setMappings((prev) => {
      const next = new Map(prev);
      next.set(placeId, ticketTypeId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const mappingArray = Array.from(mappings.entries())
        .filter(([, ttId]) => ttId)
        .map(([placeId, ttId]) => ({
          venueMapPlaceId: placeId,
          eventTicketTypeId: ttId,
        }));
      await setEventVenueMapPlaces({
        path: { eventId },
        body: { mappings: mappingArray },
      });
      showSaved();
    } finally {
      setSaving(false);
    }
  };

  if (!event) return null;

  const ticketTypes = event.ticketTypes ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <Link
        href={dashboardEventRoute(eventId)}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {event.title}
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          Venue Map
        </h1>
        <Button onClick={handleSave} disabled={saving || !selectedMap}>
          {saved ? 'Saved' : saving ? 'Saving…' : 'Save Mappings'}
        </Button>
      </div>

      {/* Map Selection */}
      <Card className="glass border-white/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Assign Venue Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Select
            value={event.venueMapId ?? '__none__'}
            onValueChange={(val) => val && handleSelectMap(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a venue map" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No venue map</SelectItem>
              {allMaps.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} ({m.placeCount} places)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Place-to-Ticket-Type Mapping */}
      {selectedMap && (
        <Card className="glass border-white/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Map Places to Ticket Types
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="mb-4 text-xs text-muted-foreground">
              Assign each place on the map to a ticket type. Buyers will see the
              map and select from available places.
            </p>
            <div className="flex flex-col gap-3">
              {selectedMap.places.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <Badge variant="secondary" className="shrink-0">
                    {place.kind === 'seat' ? 'Seat' : 'Section'}
                  </Badge>
                  <span className="min-w-[120px] text-sm font-medium">
                    {place.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    cap: {place.capacity}
                  </span>
                  <Select
                    value={mappings.get(place.id) ?? ''}
                    onValueChange={(val) => val && updateMapping(place.id, val)}
                  >
                    <SelectTrigger className="ml-auto w-[200px]">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketTypes.map((tt) => (
                        <SelectItem key={tt.id} value={tt.id}>
                          {tt.name} — €{tt.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
