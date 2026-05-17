'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScanQrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getScannersForEvent } from '@/lib/api';
import type { ScannerDto } from '@/lib/api/types.gen';
import { dashboardEventScannersRoute } from '@/lib/routes';

export const EventScannersCard = ({ eventId }: { eventId: string }) => {
  const [scanners, setScanners] = useState<ScannerDto[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getScannersForEvent({ path: { eventId } })
      .then(({ data }) => {
        if (data) setScanners(data);
      })
      .finally(() => setLoaded(true));
  }, [eventId]);

  const manageRoute = dashboardEventScannersRoute(eventId);
  const activeCount = scanners.filter((s) => s.isActive).length;

  return (
    <Card className="glass border-white/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Scanners
        </CardTitle>
        <Link
          href={manageRoute}
          className={`${buttonVariants({ variant: 'outline', size: 'sm' })} gap-1.5`}
        >
          <ScanQrCode className="size-3.5" />
          Manage
        </Link>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {loaded && scanners.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
            <ScanQrCode className="size-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">
                No scanners yet
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Invite workers to scan tickets at this event.
              </p>
            </div>
            <Link href={manageRoute} className={buttonVariants({ size: 'sm' })}>
              Invite scanners
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="divide-y divide-border">
              {scanners.slice(0, 4).map((scanner) => (
                <div
                  key={scanner.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <p className="text-sm font-medium text-foreground">
                    {scanner.firstName} {scanner.lastName}
                  </p>
                  <Badge
                    variant={scanner.isActive ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {scanner.isActive ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
            {scanners.length > 4 && (
              <p className="text-xs text-muted-foreground">
                +{scanners.length - 4} more · {activeCount} active
              </p>
            )}
            {scanners.length <= 4 && (
              <p className="text-xs text-muted-foreground">
                {activeCount} active
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
