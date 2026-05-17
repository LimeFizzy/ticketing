import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChartLegend } from '@/components/dashboard/analytics/chart-legend';
import type { EventAnalyticsDto } from '@/lib/api/types.gen';
import { formatCurrencyEur, formatPercentage } from '@/lib/formatters';
import {
  CHART_COLORS,
  CHART_TICK_STYLE,
  CHART_TOOLTIP_STYLE,
} from '@/lib/chart-utils';

interface TicketTypesCardProps {
  analytics: EventAnalyticsDto;
  fillPct: number;
}

export const TicketTypesCard = ({
  analytics,
  fillPct,
}: TicketTypesCardProps) => (
  <Card className="glass border-white/40 shadow-sm">
    <CardContent className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Ticket Types
          </h2>
          <span className="text-xs text-muted-foreground">
            {analytics.ticketsSold} / {analytics.totalCapacity} sold (
            {fillPct.toFixed(1)}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(fillPct, 100)}%` }}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Type</th>
              <th className="pb-2 pr-4 text-right font-medium">Sold</th>
              <th className="pb-2 pr-4 text-right font-medium">Capacity</th>
              <th className="pb-2 pr-4 text-right font-medium">Sell-through</th>
              <th className="pb-2 pr-4 text-right font-medium">Revenue</th>
              <th className="pb-2 text-right font-medium">Rev. share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {analytics.byTicketType.map((tt) => (
              <tr key={tt.typeName}>
                <td className="py-2.5 pr-4 font-medium text-foreground">
                  {tt.typeName}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                  {tt.sold}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                  {tt.capacity}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                  {formatPercentage(tt.sold, tt.capacity)}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                  {formatCurrencyEur(tt.revenue)}
                </td>
                <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                  {formatPercentage(tt.revenue, analytics.totalRevenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {analytics.byTicketType.length > 1 && (
        <div className="pt-2">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Revenue distribution
          </p>
          <ResponsiveContainer
            width="100%"
            height={analytics.byTicketType.length * 44}
          >
            <BarChart
              layout="vertical"
              data={analytics.byTicketType}
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) => formatCurrencyEur(v)}
                tick={CHART_TICK_STYLE}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="typeName"
                width={110}
                tick={CHART_TICK_STYLE}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(v) => [formatCurrencyEur(v as number), 'Revenue']}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              <Bar
                dataKey="revenue"
                fill={CHART_COLORS.primary}
                radius={[0, 4, 4, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
          <ChartLegend
            items={[
              {
                color: CHART_COLORS.primary,
                label: 'Revenue',
                shape: 'square',
              },
            ]}
          />
        </div>
      )}
    </CardContent>
  </Card>
);
