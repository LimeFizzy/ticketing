import Link from 'next/link';
import { cookies } from 'next/headers';
import { CalendarDays, MapPin, ScanQrCode } from 'lucide-react';
import { getScannerEvents, getScannerStatus } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { scannerEventCheckInRoute } from '@/lib/routes';
import { formatTicketDate } from '@/lib/formatters';

const ScannerPortalPage = async () => {
  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };

  const [{ data: status }, { data: events }] = await Promise.all([
    getScannerStatus({ headers }),
    getScannerEvents({ headers }),
  ]);

  if (!status?.isScanner) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center">
        <ScanQrCode className="size-12 text-muted-foreground/40" />
        <h1 className="font-display text-2xl tracking-tight text-foreground">
          No scanner access
        </h1>
        <p className="text-sm text-muted-foreground">
          You have not been assigned as a scanner for any events.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          Scanner Portal
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your assigned events
        </p>
      </div>

      {!events || events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <CalendarDays className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">
            No events assigned
          </p>
          <p className="text-xs text-muted-foreground">
            You will see events here once an organizer assigns you.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <Card
              key={event.eventId}
              className="glass border-white/40 shadow-sm"
            >
              <CardContent className="flex items-center gap-4 p-4">
                {event.eventImageUrl && (
                  <img
                    src={event.eventImageUrl}
                    alt={event.eventTitle}
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {event.eventTitle}
                  </p>
                  <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3 shrink-0" />
                      {formatTicketDate(event.eventDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 shrink-0" />
                      {event.eventVenue}
                    </span>
                  </div>
                </div>
                <Link
                  href={scannerEventCheckInRoute(event.eventId)}
                  className={`${buttonVariants({ size: 'sm' })} shrink-0 gap-1.5`}
                >
                  <ScanQrCode className="size-3.5" />
                  Check In
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScannerPortalPage;
