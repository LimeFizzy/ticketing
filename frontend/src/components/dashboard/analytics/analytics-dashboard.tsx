'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import { KpiGrid } from '@/components/dashboard/analytics/kpi-grid';
import { exportAttendeesCsv } from '@/lib/api';
import { formatCurrencyEur, formatPercentage } from '@/lib/formatters';
import { downloadBlob } from '@/lib/utils';
import { dashboardAnalyticsEventRoute } from '@/lib/routes';
import type {
  EventAnalyticsDto,
  OrganizerAnalyticsSummaryDto,
} from '@/lib/api/types.gen';
import type { EventRating } from '@/app/dashboard/analytics/page';

interface Props {
  summary: OrganizerAnalyticsSummaryDto | null;
  events: EventAnalyticsDto[];
  eventRatings: Record<string, EventRating>;
}

export const AnalyticsDashboard = ({
  summary,
  events,
  eventRatings,
}: Props) => {
  const router = useRouter();
  const [exportingId, setExportingId] = useState<string | null>(null);

  const kpis = summary
    ? [
        { label: 'Total Events', value: summary.totalEvents.toLocaleString() },
        {
          label: 'Total Revenue',
          value: formatCurrencyEur(summary.totalRevenue),
        },
        {
          label: 'Tickets Sold',
          value: summary.totalTicketsSold.toLocaleString(),
        },
        {
          label: 'Checked In',
          value: summary.totalTicketsCheckedIn.toLocaleString(),
        },
        {
          label: 'Check-in Rate',
          value: `${summary.overallCheckInRate.toFixed(1)}%`,
        },
      ]
    : [];

  const handleExportCsv = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    setExportingId(eventId);
    try {
      const { data } = await exportAttendeesCsv({ path: { eventId } });
      if (data) downloadBlob(data as Blob, `attendees-${eventId}.csv`);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <h1 className="font-display text-3xl tracking-tight text-foreground">
        Analytics
      </h1>

      {kpis.length > 0 && <KpiGrid kpis={kpis} cols={5} />}

      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5">
          <h2 className="text-base font-semibold text-foreground">Events</h2>

          {events.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No event analytics available yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Event</th>
                    <th className="pb-2 pr-4 text-right font-medium">
                      Revenue
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium">
                      Sold / Cap
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium">
                      Sell-through
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium">
                      Check-in
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium">Rating</th>
                    <th className="pb-2 font-medium sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.map((event) => {
                    const rating = eventRatings[event.eventId];
                    return (
                      <tr
                        key={event.eventId}
                        onClick={() =>
                          router.push(
                            dashboardAnalyticsEventRoute(event.eventId)
                          )
                        }
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                      >
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {event.eventTitle}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                          {formatCurrencyEur(event.totalRevenue)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                          {event.ticketsSold} / {event.totalCapacity}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                          {formatPercentage(
                            event.ticketsSold,
                            event.totalCapacity
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                          {event.checkInRate.toFixed(1)}%
                        </td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">
                          {rating?.rating != null ? (
                            <span className="inline-flex items-center justify-end gap-1">
                              <Star className="size-3.5 fill-amber-400 text-amber-400" />
                              {rating.rating.toFixed(1)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3">
                          <TooltipProvider>
                            <div className="flex items-center justify-end">
                              <Tooltip label="Export CSV">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={exportingId === event.eventId}
                                  onClick={(e) =>
                                    handleExportCsv(e, event.eventId)
                                  }
                                >
                                  {exportingId === event.eventId ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                  ) : (
                                    <Download className="size-3.5" />
                                  )}
                                </Button>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
