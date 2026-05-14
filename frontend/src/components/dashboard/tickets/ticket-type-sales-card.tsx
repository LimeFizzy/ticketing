import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrganizerEventTicketTypeDto } from '@/lib/api/types.gen';

export const TicketTypeSalesCard = ({
  ticketType,
}: {
  ticketType: OrganizerEventTicketTypeDto;
}) => {
  const soldPct =
    ticketType.capacity > 0
      ? Math.min(100, (ticketType.sold / ticketType.capacity) * 100)
      : 0;

  return (
    <Card className="glass border-white/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sales
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-6 pt-0">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{ticketType.sold} sold</span>
            <span>{ticketType.capacity} total</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${soldPct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
              {ticketType.capacity - ticketType.sold}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
              €{(ticketType.sold * ticketType.price).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
