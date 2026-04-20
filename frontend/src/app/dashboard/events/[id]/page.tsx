import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/api';
import { EditEventForm } from '@/components/dashboard/events/edit-event-form';

const EditEventPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const cookieStore = await cookies();
  const { data: event } = await getEventById({
    path: { id },
    headers: { Cookie: cookieStore.toString() },
  });

  if (!event) notFound();

  return <EditEventForm event={event} />;
};

export default EditEventPage;
