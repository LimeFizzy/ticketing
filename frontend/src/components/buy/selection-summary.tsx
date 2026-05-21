'use client';

import { useState } from 'react';
import { Loader2, Tag, Ticket, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { QuantityStepper } from '@/components/buy/quantity-stepper';
import { validatePromoCode } from '@/lib/api';
import type { ValidatePromoCodeResponse } from '@/lib/api/types.gen';
import { MAX_PLACES_PER_ORDER } from '@/lib/buy-utils';
import { formatCurrencyEur } from '@/lib/formatters';

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
  eventId: string;
  lines: SelectionLine[];
  totalQuantity: number;
  totalPrice: number;
  submitting?: boolean;
  onContinue: (promoCode?: string) => void;
}

const calcDiscount = (
  promo: ValidatePromoCodeResponse,
  totalPrice: number
): number => {
  if (!promo.valid || promo.discountValue == null) return 0;
  if (promo.discountType === 'Percentage')
    return (totalPrice * promo.discountValue) / 100;
  return Math.min(promo.discountValue, totalPrice);
};

export const SelectionSummary = ({
  eventId,
  lines,
  totalQuantity,
  totalPrice,
  submitting,
  onContinue,
}: SelectionSummaryProps) => {
  const capRemaining = MAX_PLACES_PER_ORDER - totalQuantity;
  const capReached = capRemaining <= 0;

  const [codeInput, setCodeInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] =
    useState<ValidatePromoCodeResponse | null>(null);
  const [validating, setValidating] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApply = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setValidating(true);
    setPromoError(null);
    const { data } = await validatePromoCode({ body: { code, eventId } });
    setValidating(false);
    if (!data?.valid) {
      setPromoError(data?.errorMessage ?? 'Invalid promo code.');
      return;
    }
    setAppliedCode(code);
    setAppliedPromo(data);
    setCodeInput('');
  };

  const clearPromo = () => {
    setAppliedCode(null);
    setAppliedPromo(null);
    setPromoError(null);
    setCodeInput('');
  };

  const discount = appliedPromo ? calcDiscount(appliedPromo, totalPrice) : 0;
  const finalPrice = Math.max(0, totalPrice - discount);

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

        {appliedCode ? (
          <div className="flex items-center justify-between gap-2 rounded-md bg-primary/10 px-3 py-2">
            <div className="flex items-center gap-1.5 text-sm text-primary">
              <Tag className="size-3.5 shrink-0" />
              <span className="font-mono font-medium">{appliedCode}</span>
            </div>
            <button
              type="button"
              onClick={clearPromo}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Remove promo code"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value.toUpperCase());
                setPromoError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              placeholder="Promo code"
              className="h-8 font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={!codeInput.trim() || validating}
              onClick={handleApply}
            >
              {validating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        )}
        {promoError && <p className="text-xs text-destructive">{promoError}</p>}

        <Separator />

        <div className="flex flex-col gap-1.5">
          {discount > 0 && (
            <>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums text-foreground">
                  {formatCurrencyEur(totalPrice)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-primary">Discount ({appliedCode})</span>
                <span className="tabular-nums text-primary">
                  −{formatCurrencyEur(discount)}
                </span>
              </div>
            </>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">
              {formatCurrencyEur(finalPrice)}
            </span>
          </div>
        </div>

        {capReached ? (
          <p className="text-xs text-muted-foreground">
            Maximum {MAX_PLACES_PER_ORDER} tickets per order.
          </p>
        ) : null}

        <Button
          size="lg"
          className="w-full gap-2"
          disabled={totalQuantity === 0 || submitting}
          onClick={() => onContinue(appliedCode ?? undefined)}
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Ticket className="size-4" />
          )}
          {submitting ? 'Processing…' : 'Continue to payment'}
        </Button>
      </CardContent>
    </Card>
  );
};
