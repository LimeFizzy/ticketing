import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/api';
import { CheckInUi } from '@/components/dashboard/check-in/check-in-ui';
import { dashboardEventRoute } from '@/lib/routes';

const CheckInPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const cookieStore = await cookies();
  const headers = { Cookie: cookieStore.toString() };

  const { data: event } = await getEventById({ path: { id }, headers });

  if (!event) notFound();

  return (
    <CheckInUi
      eventId={id}
      eventTitle={event.title}
      backHref={dashboardEventRoute(id)}
    />
  );
};

export default CheckInPage;
