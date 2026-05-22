import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getEventById, getScannerStatus } from '@/lib/api';
import { CheckInUi } from '@/components/dashboard/check-in/check-in-ui';
import { scannerRoute } from '@/lib/routes';

const ScannerCheckInPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };

  const [{ data: status }, { data: event }] = await Promise.all([
    getScannerStatus({ headers }),
    getEventById({ path: { id }, headers }),
  ]);

  if (!status?.isScanner || !event) notFound();

  return (
    <CheckInUi
      eventId={id}
      eventTitle={event.title}
      backHref={scannerRoute()}
    />
  );
};

export default ScannerCheckInPage;
