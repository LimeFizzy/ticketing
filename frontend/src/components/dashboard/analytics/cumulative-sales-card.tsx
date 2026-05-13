import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChartLegend } from '@/components/dashboard/analytics/chart-legend';
import { formatCurrencyEur, formatChartDate } from '@/lib/formatters';
import {
  CHART_COLORS,
  CHART_TICK_STYLE,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_STYLE,
} from '@/lib/chart-utils';

interface CumulativeSalesCardProps {
  cumulativeData: Array<{ date: string; tickets: number; revenue: number }>;
}

export const CumulativeSalesCard = ({
  cumulativeData,
}: CumulativeSalesCardProps) => (
  <Card className="glass border-white/40 shadow-sm">
    <CardContent className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-foreground">
          Cumulative Sales
        </h2>
        <p className="text-xs text-muted-foreground">
          Total tickets and revenue accumulated over time
        </p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart
          data={cumulativeData}
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
                ? [formatCurrencyEur(value as number), 'Cumulative Revenue']
                : [value, 'Cumulative Tickets']
            }
            labelFormatter={(label) =>
              typeof label === 'string' ? formatChartDate(label) : label
            }
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Area
            yAxisId="tickets"
            dataKey="tickets"
            name="tickets"
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
            type="monotone"
          />
          <Area
            yAxisId="revenue"
            dataKey="revenue"
            name="revenue"
            stroke={CHART_COLORS.green}
            fill={CHART_COLORS.green}
            fillOpacity={0.1}
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
            label: 'Cumulative tickets',
            shape: 'line',
          },
          {
            color: CHART_COLORS.green,
            label: 'Cumulative revenue',
            shape: 'line',
          },
        ]}
      />
    </CardContent>
  </Card>
);
