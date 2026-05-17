import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface KpiItem {
  label: string;
  value: ReactNode;
}

interface KpiGridProps {
  kpis: KpiItem[];
  cols?: 4 | 5;
}

export const KpiGrid = ({ kpis, cols = 5 }: KpiGridProps) => (
  <div
    className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${cols === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}
  >
    {kpis.map((kpi) => (
      <Card key={kpi.label} className="glass border-white/40 shadow-sm">
        <CardContent className="flex flex-col gap-1 p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {kpi.label}
          </p>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {kpi.value}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);
