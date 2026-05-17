'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { LayoutGrid, Loader2, MapPin, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getVenueMaps,
  getVenueMapById,
  getEventVenueMapPlaces,
  setEventVenueMapPlaces,
  updateEvent,
} from '@/lib/api';
import type {
  EventDto,
  EventTicketTypeDto,
  EventVenueMapPlaceDto,
  VenueMapDto,
  VenueMapSummaryDto,
} from '@/lib/api/types.gen';
import { TICKET_TYPE_PALETTE } from '@/lib/venue-maps';
import {
  VenueMapAssignCanvas,
  CLEAR_ACTION,
} from '@/components/dashboard/events/venue-map-assign-canvas';
import { cn } from '@/lib/utils';

export const VenueCard = ({
  venue,
  city,
  event,
  ticketTypes,
  onUpdate,
  open,
  onOpenChange,
}: {
  venue: string;
  city: string;
  event: EventDto;
  ticketTypes: EventTicketTypeDto[];
  onUpdate: (updated: EventDto) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [allMaps, setAllMaps] = useState<VenueMapSummaryDto[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [fullMap, setFullMap] = useState<VenueMapDto | null>(null);
  const [mappings, setMappings] = useState<Map<string, string>>(new Map());
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError(null);
    setActiveAction(null);
    setSelectedMapId(event.venueMapId ?? null);
    setFullMap(null);
    setLoading(true);
    getVenueMaps()
      .then(({ data }) => {
        if (data) setAllMaps(data as VenueMapSummaryDto[]);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const persist = async (work: () => Promise<EventDto | null>) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await work();
      if (updated) {
        onUpdate(updated);
        onOpenChange(false);
      } else {
        setError('Failed to save. Please try again.');
      }
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const buildEventBody = (mapId: string | null) => ({
    title: event.title,
    category: event.category,
    date: event.date,
    venue: event.venue,
    city: event.city,
    imageUrl: event.imageUrl,
    description: event.description,
    featured: event.featured,
    disclaimers: event.disclaimers?.join('|') ?? null,
    status: event.status,
    venueMapId: mapId,
  });

  const handleNext = async () => {
    if (!selectedMapId) return;
    setLoading(true);
    setError(null);
    try {
      const [mapRes, mappingsRes] = await Promise.all([
        getVenueMapById({ path: { id: selectedMapId } }),
        getEventVenueMapPlaces({ path: { eventId: event.id } }),
      ]);
      if (mapRes.data) setFullMap(mapRes.data as VenueMapDto);
      if (mappingsRes.data) {
        const m = new Map<string, string>();
        (mappingsRes.data as EventVenueMapPlaceDto[]).forEach((entry) => {
          if (entry.venueMapPlaceId && entry.eventTicketTypeId)
            m.set(entry.venueMapPlaceId, entry.eventTicketTypeId);
        });
        setMappings(m);
      }
      setActiveAction(null);
      setStep(2);
    } catch {
      setError('Failed to load map details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (placeIds: string[]) => {
    if (activeAction === null) return;
    setMappings((prev) => {
      const next = new Map(prev);
      if (activeAction === CLEAR_ACTION) {
        placeIds.forEach((id) => next.delete(id));
      } else {
        placeIds.forEach((id) => next.set(id, activeAction));
      }
      return next;
    });
  };

  const toggleAction = (id: string) =>
    setActiveAction((a) => (a === id ? null : id));

  const handleSave = () =>
    persist(async () => {
      const { data } = await updateEvent({
        path: { id: event.id },
        body: buildEventBody(selectedMapId),
      });
      return (data as EventDto) ?? null;
    });

  const handleSaveWithMappings = () =>
    persist(async () => {
      const [eventResult] = await Promise.all([
        updateEvent({
          path: { id: event.id },
          body: buildEventBody(selectedMapId),
        }),
        setEventVenueMapPlaces({
          path: { eventId: event.id },
          body: {
            mappings: Array.from(mappings.entries())
              .filter(([, ttId]) => !!ttId)
              .map(([placeId, ttId]) => ({
                venueMapPlaceId: placeId,
                eventTicketTypeId: ttId,
              })),
          },
        }),
      ]);
      return (eventResult.data as EventDto) ?? null;
    });

  const selectedMapSummary = allMaps.find((m) => m.id === selectedMapId);
  const canProceedToStep2 =
    selectedMapId !== null && (selectedMapSummary?.placeCount ?? 0) > 0;

  const validationIssues = useMemo((): string[] => {
    if (!fullMap) return [];
    const mappedCapByType = new Map<string, number>();
    let unassignedCap = 0;
    for (const place of fullMap.places) {
      const ttId = mappings.get(place.id);
      if (ttId) {
        mappedCapByType.set(
          ttId,
          (mappedCapByType.get(ttId) ?? 0) + place.capacity
        );
      } else {
        unassignedCap += place.capacity;
      }
    }
    const issues: string[] = [];
    if (unassignedCap > 0) {
      issues.push(
        `${unassignedCap} seat${unassignedCap !== 1 ? 's' : ''} not assigned to any ticket type`
      );
    }
    for (const tt of ticketTypes) {
      const mapped = mappedCapByType.get(tt.id) ?? 0;
      if (mapped !== tt.capacity) {
        const diff = mapped - tt.capacity;
        issues.push(
          `${tt.name}: ${mapped} mapped vs ${tt.capacity} capacity (${diff > 0 ? '+' : ''}${diff})`
        );
      }
    }
    return issues;
  }, [fullMap, mappings, ticketTypes]);

  return (
    <Card className="glass border-white/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Location
        </CardTitle>
        {event.venueMapId && (
          <Badge variant="secondary" className="text-xs font-normal">
            Map configured
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex gap-4 rounded-lg border border-border bg-muted/20 p-4">
          <div className="shrink-0 rounded-lg border border-dashed border-border bg-muted/30 p-3">
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="size-1.5 rounded-sm bg-muted-foreground/25"
                />
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">
              {venue || '—'}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {city || '—'}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/60">
              <LayoutGrid className="size-3" />
              <span>
                {event.venueMapId
                  ? 'Seating map configured'
                  : 'Seating map not configured'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {event.venueMapId
              ? 'Configure seat-to-ticket-type mappings.'
              : 'Assign a venue map and configure seat-to-ticket-type mappings.'}
          </p>

          <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Trigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                >
                  <MapPin className="size-3.5" />
                  Manage location
                </Button>
              }
            />
            <Dialog.Portal>
              <Dialog.Backdrop
                className={cn(
                  'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm',
                  'transition-opacity duration-200',
                  'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0'
                )}
              />
              <Dialog.Popup
                className={cn(
                  'glass fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
                  'rounded-2xl border border-white/40 bg-popover p-6 shadow-xl outline-none',
                  'transition-all duration-200',
                  'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
                  'data-[ending-style]:scale-95 data-[ending-style]:opacity-0'
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="text-base font-semibold text-foreground">
                    {step === 1 ? 'Venue Map' : 'Assign Ticket Types'}
                  </Dialog.Title>
                  <Dialog.Close
                    render={
                      <Button variant="ghost" size="icon-sm">
                        <X className="size-4" />
                      </Button>
                    }
                  />
                </div>

                <Dialog.Description className="mb-4 text-sm text-muted-foreground">
                  {step === 1
                    ? 'Select the venue map for this event.'
                    : 'Select a ticket type then click places on the map to assign them.'}
                </Dialog.Description>

                {step === 1 && (
                  <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedMapId(null)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                            selectedMapId === null
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:bg-muted/30'
                          )}
                        >
                          <span className="text-sm font-medium text-foreground">
                            No venue map
                          </span>
                        </button>

                        {allMaps.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedMapId(m.id)}
                            className={cn(
                              'flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors',
                              selectedMapId === m.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:bg-muted/30'
                            )}
                          >
                            <span className="text-sm font-medium text-foreground">
                              {m.name}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {m.placeCount} place
                              {m.placeCount !== 1 ? 's' : ''}
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {step === 2 && fullMap && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {ticketTypes.map((tt, i) => {
                        const color =
                          TICKET_TYPE_PALETTE[i % TICKET_TYPE_PALETTE.length];
                        const isActive = activeAction === tt.id;
                        return (
                          <button
                            key={tt.id}
                            type="button"
                            onClick={() => toggleAction(tt.id)}
                            className={cn(
                              'flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors',
                              isActive
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:bg-muted/30'
                            )}
                          >
                            <span
                              className="mt-0.5 size-3 shrink-0 rounded-full"
                              style={{ backgroundColor: color.fill }}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {tt.name}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                €{tt.price} · {tt.capacity} cap
                              </p>
                            </div>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => toggleAction(CLEAR_ACTION)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border p-3 text-left transition-colors',
                          activeAction === CLEAR_ACTION
                            ? 'border-destructive bg-destructive/10'
                            : 'border-border hover:bg-muted/30'
                        )}
                      >
                        <X
                          className={cn(
                            'size-3 shrink-0',
                            activeAction === CLEAR_ACTION
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            activeAction === CLEAR_ACTION
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          )}
                        >
                          Clear
                        </span>
                      </button>
                    </div>

                    <VenueMapAssignCanvas
                      venueMap={fullMap}
                      mappings={mappings}
                      ticketTypes={ticketTypes}
                      activeAction={activeAction}
                      onAssign={handleAssign}
                    />

                    {activeAction === null && (
                      <p className="text-center text-xs text-muted-foreground">
                        Select a ticket type above to start painting.
                      </p>
                    )}

                    {validationIssues.length > 0 && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 flex flex-col gap-1">
                        {validationIssues.map((issue, i) => (
                          <p key={i} className="text-xs text-destructive">
                            ⚠ {issue}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3">
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex items-center justify-between gap-3">
                    {step === 2 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStep(1);
                          setActiveAction(null);
                        }}
                        disabled={saving}
                      >
                        ← Back
                      </Button>
                    ) : (
                      <Dialog.Close
                        render={
                          <Button variant="ghost" size="sm" disabled={saving}>
                            Cancel
                          </Button>
                        }
                      />
                    )}

                    {step === 2 ? (
                      <Button
                        size="sm"
                        onClick={handleSaveWithMappings}
                        disabled={saving || validationIssues.length > 0}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </Button>
                    ) : canProceedToStep2 ? (
                      <Button
                        size="sm"
                        onClick={handleNext}
                        disabled={loading || saving}
                      >
                        {loading ? 'Loading…' : 'Next →'}
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                      </Button>
                    )}
                  </div>
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </CardContent>
    </Card>
  );
};
