'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { getPromoCodes } from '@/lib/api';
import type { PromoCodeDto } from '@/lib/api/types.gen';
import { dashboardEventPromoCodesRoute } from '@/lib/routes';
import { formatCurrencyEur } from '@/lib/formatters';

const isActive = (code: PromoCodeDto) =>
  code.isActive && (!code.expiresAt || new Date(code.expiresAt) >= new Date());

const formatDiscount = (code: PromoCodeDto) =>
  code.discountType === 'percentage'
    ? `${code.discountValue}%`
    : formatCurrencyEur(code.discountValue);

export const EventPromoCodesCard = ({ eventId }: { eventId: string }) => {
  const [codes, setCodes] = useState<PromoCodeDto[]>([]);

  useEffect(() => {
    getPromoCodes({ path: { eventId } }).then(({ data }) => {
      if (data) setCodes(data);
    });
  }, [eventId]);

  const manageRoute = dashboardEventPromoCodesRoute(eventId);
  const activeCodes = codes.filter(isActive);

  return (
    <Card className="glass border-white/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Promo Codes
        </CardTitle>
        <Link
          href={manageRoute}
          className={`${buttonVariants({ variant: 'outline', size: 'sm' })} gap-1.5`}
        >
          <Tag className="size-3.5" />
          Manage
        </Link>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {codes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
            <Tag className="size-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">
                No promo codes yet
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Create discount codes for your attendees.
              </p>
            </div>
            <Link href={manageRoute} className={buttonVariants({ size: 'sm' })}>
              Add promo codes
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="divide-y divide-border">
              {codes.slice(0, 4).map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <p className="font-mono text-sm font-medium text-foreground">
                    {code.code}
                  </p>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {formatDiscount(code)}
                    </span>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {code.currentUses} used
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {codes.length > 4 && (
              <p className="text-xs text-muted-foreground">
                +{codes.length - 4} more · {activeCodes.length} active
              </p>
            )}
            {codes.length <= 4 && (
              <p className="text-xs text-muted-foreground">
                {activeCodes.length} active
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
