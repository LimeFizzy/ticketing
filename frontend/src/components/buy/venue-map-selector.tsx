'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { SelectionSummary } from '@/components/buy/selection-summary';
import { VenueMapCanvas } from '@/components/buy/venue-map-canvas';
import { VenueMapLegend } from '@/components/buy/venue-map-legend';
import { VenueMapZoomControls } from '@/components/buy/venue-map-zoom-controls';
import { type VenueMap } from '@/types/venue-map';
import { buildTicketTypeColors } from '@/lib/venue-maps';
import { usePanZoom } from '@/hooks/use-pan-zoom';
import { useTicketSelection } from '@/hooks/use-ticket-selection';
import { useRestoreSelection } from '@/hooks/use-restore-selection';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { createCheckoutSession, type EventDto } from '@/lib/api';
import { extractApiError } from '@/lib/api-error';
import { saveSelection } from '@/lib/buy-utils';
import { eventBuyRoute, Route } from '@/lib/routes';

interface VenueMapSelectorProps {
  event: EventDto;
  venueMap: VenueMap;
}

export const VenueMapSelector = ({
  event,
  venueMap,
}: VenueMapSelectorProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    selection,
    setQuantity,
    total,
    capRemaining,
    unitPriceFor,
    unitNameFor,
  } = useTicketSelection(event);

  useRestoreSelection(event.id, setQuantity);

  const placesById = useMemo(
    () => new Map(venueMap.places.map((p) => [p.id, p])),
    [venueMap.places]
  );

  const colors = useMemo(() => buildTicketTypeColors(event), [event]);

  const handleTap = (clientX: number, clientY: number) => {
    const target = document.elementFromPoint(clientX, clientY);
    const placeEl = target?.closest('[data-place-id]') as HTMLElement | null;
    if (!placeEl?.dataset.placeId) return;
    const place = placesById.get(placeEl.dataset.placeId);
    if (!place || place.available === 0 || !place.ticketTypeId) return;
    const qty = selection[place.id] ?? 0;

    if (place.kind === 'seat') {
      if (qty === 1) setQuantity(place.id, 0);
      else if (capRemaining > 0) setQuantity(place.id, 1);
      return;
    }
    if (qty >= place.available || capRemaining <= 0) return;
    setQuantity(place.id, qty + 1);
  };

  const { transform, bindings, zoomIn, zoomOut, reset, canZoomIn, canZoomOut } =
    usePanZoom({ containerRef, onTap: handleTap });

  const transformStyle = {
    transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
    transformOrigin: '0 0',
  };

  const totalPrice = useMemo(
    () =>
      Object.entries(selection).reduce((sum, [placeId, qty]) => {
        const place = placesById.get(placeId);
        if (!place) return sum;
        return sum + qty * unitPriceFor(place.ticketTypeId);
      }, 0),
    [selection, placesById, unitPriceFor]
  );

  const lines = useMemo(
    () =>
      venueMap.places
        .filter((p) => (selection[p.id] ?? 0) > 0)
        .map((p) => {
          const typeName = unitNameFor(p.ticketTypeId);
          return {
            key: p.id,
            title: p.kind === 'seat' ? `${typeName} — ${p.label}` : p.label,
            subtitle: p.kind === 'section' ? typeName : undefined,
            unitPrice: unitPriceFor(p.ticketTypeId),
            quantity: selection[p.id] ?? 0,
            max: p.available,
            onQuantityChange: (next: number) => setQuantity(p.id, next),
          };
        }),
    [venueMap.places, selection, unitNameFor, unitPriceFor, setQuantity]
  );

  const handleContinue = useCallback(
    async (promoCode?: string) => {
      if (!isAuthenticated) {
        saveSelection(event.id, selection);
        const next = encodeURIComponent(eventBuyRoute(event.id));
        router.push(`${Route.SignUp}?next=${next}`);
        return;
      }

      setSubmitting(true);
      try {
        const items = Object.entries(selection)
          .filter(([, qty]) => qty > 0)
          .map(([placeId, quantity]) => ({
            eventTicketTypeId: placesById.get(placeId)!.ticketTypeId,
            quantity,
            venueMapPlaceId: placeId,
          }));
        const { data, error } = await createCheckoutSession({
          body: { eventId: event.id, items, promoCode: promoCode ?? null },
        });
        if (error) {
          toast.error(
            extractApiError(error, 'Checkout failed. Please try again.'),
            { duration: Infinity }
          );
          return;
        }
        if (!data?.sessionUrl) {
          toast.error('Checkout failed. Please try again.', {
            duration: Infinity,
          });
          return;
        }
        window.location.href = data.sessionUrl;
      } finally {
        setSubmitting(false);
      }
    },
    [isAuthenticated, selection, placesById, event.id]
  );

  const stopDrag: React.PointerEventHandler<HTMLDivElement> = (e) =>
    e.stopPropagation();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
      <div className="flex min-w-0 flex-col gap-3">
        <Card className="glass border-white/40 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-2 sm:p-4">
            <div
              ref={containerRef}
              className="relative w-full cursor-grab touch-none select-none overflow-hidden rounded-xl bg-muted/30 active:cursor-grabbing"
              style={{ height: 520, minHeight: 520 }}
              {...bindings}
            >
              <VenueMapCanvas
                event={event}
                venueMap={venueMap}
                selection={selection}
                capRemaining={capRemaining}
                colors={colors}
                unitPriceFor={unitPriceFor}
                unitNameFor={unitNameFor}
                transformStyle={transformStyle}
              />
              <VenueMapZoomControls
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onReset={reset}
                canZoomIn={canZoomIn}
                canZoomOut={canZoomOut}
                onPointerDown={stopDrag}
              />
            </div>

            <VenueMapLegend event={event} colors={colors} />
          </CardContent>
        </Card>
      </div>

      <SelectionSummary
        eventId={event.id}
        lines={lines}
        totalQuantity={total}
        totalPrice={totalPrice}
        submitting={submitting}
        onContinue={handleContinue}
      />
    </div>
  );
};
