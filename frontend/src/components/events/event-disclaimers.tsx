import { Card, CardContent } from '@/components/ui/card';
import { STATIC_DISCLAIMERS } from '@/lib/disclaimers';

interface EventDisclaimersProps {
  extras?: string[];
}

export const EventDisclaimers = ({ extras }: EventDisclaimersProps) => {
  const items = [...STATIC_DISCLAIMERS, ...(extras ?? [])];

  return (
    <Card className="glass border-white/40 shadow-sm">
      <CardContent className="flex flex-col gap-3 p-6">
        <h2 className="text-lg font-semibold text-foreground">Important info</h2>
        <ul className="flex flex-col gap-2 text-sm leading-relaxed text-foreground/80">
          {items.map((line, idx) => (
            <li key={idx} className="flex gap-2">
              <span aria-hidden className="select-none text-muted-foreground">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
