import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { eventBuyRoute } from '@/lib/routes';

interface EventPurchaseCardProps {
  eventId: string;
  priceFrom: number;
}

export const EventPurchaseCard = ({
  eventId,
  priceFrom,
}: EventPurchaseCardProps) => (
  <Card className="glass border-white/50 shadow-sm">
    <CardContent className="flex items-center justify-between gap-4 p-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Starting from
        </p>
        <p className="text-3xl font-bold text-primary">
          {formatPrice(priceFrom)}
        </p>
      </div>
      <Link
        href={eventBuyRoute(eventId)}
        className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}
      >
        <Ticket className="size-4" />
        Buy Tickets
      </Link>
    </CardContent>
  </Card>
);
