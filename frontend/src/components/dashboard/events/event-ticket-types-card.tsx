import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import type { EventTicketTypeDto } from '@/lib/api/types.gen';

export const EventTicketTypesCard = ({
  eventId,
  ticketTypes,
  manageRoute,
}: {
  eventId: string;
  ticketTypes: Array<EventTicketTypeDto>;
  manageRoute: string;
}) => (
  <Card className="glass border-white/40 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Ticket Types
      </CardTitle>
      <Link
        href={manageRoute}
        className={`${buttonVariants({ variant: 'outline', size: 'sm' })} gap-1.5`}
      >
        <Ticket className="size-3.5" />
        Manage
      </Link>
    </CardHeader>
    <CardContent className="p-6 pt-0">
      {ticketTypes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
          <Ticket className="size-8 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-foreground">
              No ticket types yet
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add ticket types so attendees can purchase tickets.
            </p>
          </div>
          <Link
            href={manageRoute}
            className={buttonVariants({ size: 'sm' })}
          >
            Add ticket types
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {ticketTypes.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {t.name}
                </p>
                {t.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {t.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  €{t.price}
                </span>
                <span className="tabular-nums text-xs text-muted-foreground">
                  {t.sold} / {t.capacity} sold
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
