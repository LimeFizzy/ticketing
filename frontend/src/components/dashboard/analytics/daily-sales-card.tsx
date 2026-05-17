import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChartLegend } from '@/components/dashboard/analytics/chart-legend';
import type { EventAnalyticsDto } from '@/lib/api/types.gen';
import { formatCurrencyEur, formatChartDate } from '@/lib/formatters';
import {
  CHART_COLORS,
  CHART_TICK_STYLE,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_STYLE,
} from '@/lib/chart-utils';

interface DailySalesCardProps {
  dailySales: EventAnalyticsDto['dailySales'];
}

export const DailySalesCard = ({ dailySales }: DailySalesCardProps) => (
  <Card className="glass border-white/40 shadow-sm">
    <CardContent className="flex flex-col gap-4 p-5">
      <h2 className="text-base font-semibold text-foreground">Daily Sales</h2>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart
          data={dailySales}
          margin={{ top: 4, right: 52, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_GRID_STROKE}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatChartDate}
            tick={CHART_TICK_STYLE}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="tickets"
            orientation="left"
            allowDecimals={false}
            tick={CHART_TICK_STYLE}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tickFormatter={(v) => `€${v}`}
            tick={CHART_TICK_STYLE}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value, name) =>
              name === 'revenue'
                ? [formatCurrencyEur(value as number), 'Revenue']
                : [value, 'Tickets Sold']
            }
            labelFormatter={(label) =>
              typeof label === 'string' ? formatChartDate(label) : label
            }
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Bar
            yAxisId="tickets"
            dataKey="ticketsSold"
            name="ticketsSold"
            fill={CHART_COLORS.primary}
            radius={[3, 3, 0, 0]}
            maxBarSize={40}
          />
          <Area
            yAxisId="revenue"
            dataKey="revenue"
            name="revenue"
            stroke={CHART_COLORS.teal}
            fill={CHART_COLORS.teal}
            fillOpacity={0.12}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <ChartLegend
        items={[
          {
            color: CHART_COLORS.primary,
            label: 'Tickets sold',
            shape: 'square',
          },
          { color: CHART_COLORS.teal, label: 'Revenue', shape: 'line' },
        ]}
      />
    </CardContent>
  </Card>
);
