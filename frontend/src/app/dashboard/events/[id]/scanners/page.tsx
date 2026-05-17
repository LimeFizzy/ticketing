import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ChevronLeft } from 'lucide-react';
import { getEventById, getScannersForEvent } from '@/lib/api';
import { ScannersList } from '@/components/dashboard/scanners/scanners-list';
import { dashboardEventRoute } from '@/lib/routes';

const EventScannersPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };

  const [{ data: event }, { data: scanners }] = await Promise.all([
    getEventById({ path: { id }, headers }),
    getScannersForEvent({ path: { eventId: id }, headers }),
  ]);

  if (!event) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <Link
        href={dashboardEventRoute(id)}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {event.title}
      </Link>

      <h1 className="mb-6 font-display text-3xl tracking-tight text-foreground">
        Scanners
      </h1>

      <ScannersList eventId={id} initialScanners={scanners ?? []} />
    </div>
  );
};

export default EventScannersPage;
