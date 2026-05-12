'use client';

import { Ticket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QuantityStepper } from '@/components/buy/quantity-stepper';
import { MAX_PLACES_PER_ORDER } from '@/lib/buy-utils';

export interface SelectionLine {
  key: string;
  title: string;
  subtitle?: string | null;
  unitPrice: number;
  quantity: number;
  max: number;
  onQuantityChange: (next: number) => void;
}

interface SelectionSummaryProps {
  lines: SelectionLine[];
  totalQuantity: number;
  totalPrice: number;
  onContinue: () => void;
}

export const SelectionSummary = ({
  lines,
  totalQuantity,
  totalPrice,
  onContinue,
}: SelectionSummaryProps) => {
  const capRemaining = MAX_PLACES_PER_ORDER - totalQuantity;
  const capReached = capRemaining <= 0;

  return (
    <Card className="glass border-white/40 shadow-sm lg:sticky lg:top-6 lg:self-start">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Your selection
          </h2>
          <span className="text-xs text-muted-foreground">
            {totalQuantity} / {MAX_PLACES_PER_ORDER}
          </span>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tickets selected yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {lines.map((line) => {
              const lineMax = Math.min(line.max, line.quantity + capRemaining);
              return (
                <li
                  key={line.key}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {line.title}
                    </p>
                    {line.subtitle ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {line.subtitle}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      €{line.unitPrice} each
                    </p>
                  </div>
                  <QuantityStepper
                    value={line.quantity}
                    onChange={line.onQuantityChange}
                    max={lineMax}
                  />
                </li>
              );
            })}
          </ul>
        )}

        <Separator />

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">
            €{totalPrice}
          </span>
        </div>

        {capReached ? (
          <p className="text-xs text-muted-foreground">
            Maximum {MAX_PLACES_PER_ORDER} tickets per order.
          </p>
        ) : null}

        <Button
          size="lg"
          className="w-full gap-2"
          disabled={totalQuantity === 0}
          onClick={onContinue}
        >
          <Ticket className="size-4" />
          Continue to payment
        </Button>
      </CardContent>
    </Card>
  );
};
