'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KpiGrid } from '@/components/dashboard/analytics/kpi-grid';
import type { KpiItem } from '@/components/dashboard/analytics/kpi-grid';
import { TicketTypesCard } from '@/components/dashboard/analytics/ticket-types-card';
import { DailySalesCard } from '@/components/dashboard/analytics/daily-sales-card';
import { CumulativeSalesCard } from '@/components/dashboard/analytics/cumulative-sales-card';
import { ReviewsCard } from '@/components/dashboard/analytics/reviews-card';
import { PromoCodesCard } from '@/components/dashboard/analytics/promo-codes-card';
import { exportAttendeesCsv } from '@/lib/api';
import type {
  EventAnalyticsDto,
  EventDto,
  EventReviewsSummaryDto,
  PromoCodeDto,
} from '@/lib/api/types.gen';
import { dashboardAnalyticsRoute } from '@/lib/routes';
import {
  formatEventDateLong,
  formatCurrencyEur,
  formatPercentage,
} from '@/lib/formatters';
import { downloadBlob } from '@/lib/utils';

interface Props {
  analytics: EventAnalyticsDto;
  event: EventDto;
  reviews?: EventReviewsSummaryDto | null;
  promoCodes?: PromoCodeDto[];
}

export const EventAnalyticsDashboard = ({
  analytics,
  event,
  reviews,
  promoCodes,
}: Props) => {
  const [exporting, setExporting] = useState(false);

  const avgPrice =
    analytics.ticketsSold > 0
      ? analytics.totalRevenue / analytics.ticketsSold
      : null;

  const fillPct =
    analytics.totalCapacity > 0
      ? (analytics.ticketsSold / analytics.totalCapacity) * 100
      : 0;

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const { data } = await exportAttendeesCsv({
        path: { eventId: analytics.eventId },
      });
      if (data)
        downloadBlob(data as Blob, `attendees-${analytics.eventId}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const cumulativeData = useMemo(
    () =>
      analytics.dailySales.reduce(
        (acc, day) => {
          const prev = acc[acc.length - 1];
          acc.push({
            date: day.date,
            tickets: (prev?.tickets ?? 0) + day.ticketsSold,
            revenue: (prev?.revenue ?? 0) + day.revenue,
          });
          return acc;
        },
        [] as Array<{ date: string; tickets: number; revenue: number }>
      ),
    [analytics.dailySales]
  );

  const kpis: KpiItem[] = [
    { label: 'Revenue', value: formatCurrencyEur(analytics.totalRevenue) },
    {
      label: 'Tickets Sold',
      value: `${analytics.ticketsSold} / ${analytics.totalCapacity}`,
    },
    {
      label: 'Avg. Ticket Price',
      value: avgPrice != null ? formatCurrencyEur(avgPrice) : '—',
    },
    {
      label: 'Checked In',
      value: `${analytics.ticketsCheckedIn} / ${analytics.ticketsSold}`,
    },
    {
      label: 'Check-in Rate',
      value: `${analytics.checkInRate.toFixed(1)}%`,
    },
    {
      label: 'Sell-through',
      value: formatPercentage(analytics.ticketsSold, analytics.totalCapacity),
    },
    ...(event.averageRating != null
      ? [
          {
            label: 'Rating',
            value: (
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {event.averageRating.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground">
                  ({event.reviewCount ?? 0})
                </span>
              </span>
            ),
          } satisfies KpiItem,
        ]
      : []),
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <Link
        href={dashboardAnalyticsRoute()}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All events
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl tracking-tight text-foreground">
            {analytics.eventTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatEventDateLong(event.date)} &middot; {event.venue},{' '}
            {event.city}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          disabled={exporting}
          className="shrink-0 gap-1.5"
        >
          {exporting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          Export CSV
        </Button>
      </div>

      <KpiGrid kpis={kpis} cols={4} />

      {analytics.byTicketType.length > 0 && (
        <TicketTypesCard analytics={analytics} fillPct={fillPct} />
      )}

      {analytics.dailySales.length > 0 && (
        <DailySalesCard dailySales={analytics.dailySales} />
      )}

      {cumulativeData.length > 1 && (
        <CumulativeSalesCard cumulativeData={cumulativeData} />
      )}

      {reviews && reviews.totalReviews > 0 && <ReviewsCard reviews={reviews} />}

      {promoCodes && promoCodes.length > 0 && (
        <PromoCodesCard codes={promoCodes} />
      )}
    </div>
  );
};
