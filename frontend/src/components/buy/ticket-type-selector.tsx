'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { QuantityStepper } from '@/components/buy/quantity-stepper';
import { SelectionSummary } from '@/components/buy/selection-summary';
import { useTicketSelection } from '@/hooks/use-ticket-selection';
import { useRestoreSelection } from '@/hooks/use-restore-selection';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { createCheckoutSession, type EventDto } from '@/lib/api';
import { extractApiError } from '@/lib/api-error';
import { saveSelection } from '@/lib/buy-utils';
import { eventBuyRoute, Route } from '@/lib/routes';

interface TicketTypeSelectorProps {
  event: EventDto;
}

export const TicketTypeSelector = ({ event }: TicketTypeSelectorProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { selection, setQuantity, total, capRemaining } =
    useTicketSelection(event);

  useRestoreSelection(event.id, setQuantity);

  const remaining = Object.fromEntries(
    event.ticketTypes.map((t) => [t.id, t.capacity - t.sold])
  );

  const totalPrice = event.ticketTypes.reduce(
    (sum, t) => sum + (selection[t.id] ?? 0) * t.price,
    0
  );

  const handleContinue = async (promoCode?: string) => {
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
        .map(([ticketTypeId, quantity]) => ({
          eventTicketTypeId: ticketTypeId,
          quantity,
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
  };

  const lines = event.ticketTypes
    .filter((t) => (selection[t.id] ?? 0) > 0)
    .map((t) => ({
      key: t.id,
      title: t.name,
      subtitle: t.description,
      unitPrice: t.price,
      quantity: selection[t.id] ?? 0,
      max: remaining[t.id] ?? 0,
      onQuantityChange: (next: number) => setQuantity(t.id, next),
    }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
      <ul className="flex min-w-0 flex-col gap-3">
        {event.ticketTypes.map((t) => {
          const qty = selection[t.id] ?? 0;
          const typeMax = remaining[t.id] ?? 0;
          const lineMax = Math.min(typeMax, qty + capRemaining);
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
