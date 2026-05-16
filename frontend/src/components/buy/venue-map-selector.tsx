'use client';

import { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  SelectionSummary,
} from '@/components/buy/selection-summary';
import { VenueMapCanvas } from '@/components/buy/venue-map-canvas';
import { VenueMapLegend } from '@/components/buy/venue-map-legend';
import { VenueMapZoomControls } from '@/components/buy/venue-map-zoom-controls';
import { type VenueMap } from '@/types/venue-map';
import { buildTicketTypeColors } from '@/lib/venue-maps';
import { usePanZoom } from '@/hooks/use-pan-zoom';
import { useTicketSelection } from '@/hooks/use-ticket-selection';
import { createCheckoutSession, type EventDto } from '@/lib/api';

interface VenueMapSelectorProps {
  event: EventDto;
  venueMap: VenueMap;
}

export const VenueMapSelector = ({
  event,
  venueMap,
}: VenueMapSelectorProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    selection,
    setQuantity,
    total,
    capRemaining,
    unitPriceFor,
    unitNameFor,
  } = useTicketSelection(event);

  const placesById = new Map(venueMap.places.map((p) => [p.id, p]));

  const colors = buildTicketTypeColors(event);

  const handleTap = (clientX: number, clientY: number) => {
    const target = document.elementFromPoint(clientX, clientY);
    const placeEl = target?.closest('[data-place-id]') as HTMLElement | null;
    if (!placeEl?.dataset.placeId) return;
    const place = placesById.get(placeEl.dataset.placeId);
    if (!place || place.available === 0) return;
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

  const totalPrice = Object.entries(selection).reduce((sum, [placeId, qty]) => {
    const place = placesById.get(placeId);
    if (!place) return sum;
    return sum + qty * unitPriceFor(place.ticketTypeId);
  }, 0);

  const lines = venueMap.places
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
  });

  const handleContinue = async () => {
    setSubmitting(true);
    setCheckoutError(null);
    try {
      const items = Object.entries(selection)
        .filter(([, qty]) => qty > 0)
        .map(([placeId, quantity]) => ({
          eventTicketTypeId: placesById.get(placeId)!.ticketTypeId,
          quantity,
          venueMapPlaceId: placeId,
        }));
      const { data, error } = await createCheckoutSession({
        body: { eventId: event.id, items },
      });
      if (error || !data?.sessionUrl) {
        setCheckoutError('Something went wrong. Please try again.');
        return;
      }
      window.location.href = data.sessionUrl;
    } finally {
      setSubmitting(false);
    }
  };

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
        lines={lines}
        totalQuantity={total}
        totalPrice={totalPrice}
        submitting={submitting}
        checkoutError={checkoutError}
        onContinue={handleContinue}
      />
    </div>
  );
};
