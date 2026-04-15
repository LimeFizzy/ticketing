'use client';

import { useCallback, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { QuantityStepper } from '@/components/buy/quantity-stepper';
import {
  SelectionSummary,
  type SelectionLine,
} from '@/components/buy/selection-summary';
import { useTicketSelection } from '@/hooks/use-ticket-selection';
import { createCheckoutSession, type EventDto } from '@/lib/api';

interface TicketTypeSelectorProps {
  event: EventDto;
}

export const TicketTypeSelector = ({ event }: TicketTypeSelectorProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { selection, setQuantity, total, capRemaining } =
    useTicketSelection(event);

  // Mock per-type cap so the user can't oversubscribe a single tier; the real
  // cap will come from the backend.
  const perTypeCap = Math.max(
    1,
    Math.ceil(event.availableTickets / event.ticketTypes.length)
  );

  const totalPrice = useMemo(
    () =>
      event.ticketTypes.reduce(
        (sum, t) => sum + (selection[t.id] ?? 0) * t.price,
        0
      ),
    [event.ticketTypes, selection]
  );

  const handleContinue = useCallback(async () => {
    setSubmitting(true);
    try {
      const items = Object.entries(selection)
        .filter(([, qty]) => qty > 0)
        .map(([ticketTypeId, quantity]) => ({
          eventTicketTypeId: ticketTypeId,
          quantity,
        }));
      const { data, error } = await createCheckoutSession({
        body: { eventId: event.id, items },
      });
      if (error || !data?.sessionUrl) {
        console.error('Checkout failed:', error);
        return;
      }
      window.location.href = data.sessionUrl;
    } finally {
      setSubmitting(false);
    }
  }, [selection, event.id]);

  const lines = useMemo<SelectionLine[]>(
    () =>
      event.ticketTypes
        .filter((t) => (selection[t.id] ?? 0) > 0)
        .map((t) => ({
          key: t.id,
          title: t.name,
          subtitle: t.description,
          unitPrice: t.price,
          quantity: selection[t.id] ?? 0,
          max: perTypeCap,
          onQuantityChange: (next: number) => setQuantity(t.id, next),
        })),
    [event.ticketTypes, selection, perTypeCap, setQuantity]
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
      <ul className="flex min-w-0 flex-col gap-3">
        {event.ticketTypes.map((t) => {
          const qty = selection[t.id] ?? 0;
          const lineMax = Math.min(perTypeCap, qty + capRemaining);
          return (
            <li key={t.id}>
              <Card className="glass border-white/40 shadow-sm">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-foreground">
                      {t.name}
                    </p>
                    {t.description ? (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {t.description}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm font-medium text-primary">
                      €{t.price}
                    </p>
                  </div>
                  <QuantityStepper
                    value={qty}
                    max={lineMax}
                    onChange={(next) => setQuantity(t.id, next)}
                  />
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <SelectionSummary
        lines={lines}
        totalQuantity={total}
        totalPrice={totalPrice}
        submitting={submitting}
        onContinue={handleContinue}
      />
    </div>
  );
};
