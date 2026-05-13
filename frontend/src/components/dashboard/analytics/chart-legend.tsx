interface ChartLegendItem {
  color: string;
  label: string;
  shape: 'square' | 'line';
}

export const ChartLegend = ({ items }: { items: ChartLegendItem[] }) => (
  <div className="flex items-center gap-4 text-xs text-muted-foreground">
    {items.map(({ color, label, shape }) => (
      <span key={label} className="flex items-center gap-1.5">
        {shape === 'square' ? (
          <span
            className="inline-block size-2.5 rounded-sm"
            style={{ background: color }}
          />
        ) : (
          <span
            className="inline-block h-0.5 w-4 rounded-full"
            style={{ background: color }}
          />
        )}
        {label}
      </span>
    ))}
  </div>
);
