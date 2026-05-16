import Link from 'next/link';
import { LayoutGrid, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboardEventVenueMapRoute } from '@/lib/routes';

export const VenueCard = ({
  venue,
  city,
  eventId,
  venueMapId,
}: {
  venue: string;
  city: string;
  eventId: string;
  venueMapId?: string | null;
}) => (
  <Card className="glass border-white/40 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Location
      </CardTitle>
      {venueMapId && (
        <Badge variant="secondary" className="text-xs font-normal">
          Map configured
        </Badge>
      )}
    </CardHeader>
    <CardContent className="p-6 pt-0">
      <div className="flex gap-4 rounded-lg border border-border bg-muted/20 p-4">
        <div className="shrink-0 rounded-lg border border-dashed border-border bg-muted/30 p-3">
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="size-1.5 rounded-sm bg-muted-foreground/25"
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">
            {venue || '—'}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {city || '—'}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/60">
            <LayoutGrid className="size-3" />
            <span>{venueMapId ? 'Seating map configured' : 'Seating map not configured'}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {venueMapId
            ? 'Configure seat-to-ticket-type mappings.'
            : 'Assign a venue map and configure seat-to-ticket-type mappings.'}
        </p>
        <Link href={dashboardEventVenueMapRoute(eventId)}>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
            <MapPin className="size-3.5" />
            Manage location
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);
