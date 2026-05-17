export const CHART_COLORS = {
  primary: 'oklch(0.58 0.18 254)',
  teal: 'oklch(0.62 0.14 200)',
  green: 'oklch(0.66 0.1 170)',
  amber: 'oklch(0.7 0.15 80)',
} as const;

export const CHART_TICK_STYLE = {
  fontSize: 11,
  fill: 'oklch(0.5 0.02 250)',
} as const;

export const CHART_GRID_STROKE = 'oklch(0.78 0.015 240 / 0.3)';

export const CHART_TOOLTIP_STYLE = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'var(--popover-foreground)',
} as const;
