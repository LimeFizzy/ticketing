import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getEventById } from '@/lib/api';
import type { OrganizerEventTicketTypeDto } from '@/lib/api/types.gen';
import { EditTicketTypeForm } from '@/components/dashboard/tickets/edit-ticket-type-form';

const EditTicketTypePage = async ({
  params,
}: {
  params: Promise<{ id: string; ticketId: string }>;
}) => {
  const { id, ticketId } = await params;
  const cookieStore = await cookies();
  const { data: event } = await getEventById({
    path: { id },
    headers: { Cookie: cookieStore.toString() },
  });

  if (!event) notFound();

  const ticketType = event.ticketTypes.find((t) => t.id === ticketId);
  if (!ticketType) notFound();

  return (
    <EditTicketTypeForm
      event={event}
      ticketType={ticketType as OrganizerEventTicketTypeDto}
    />
  );
};

export default EditTicketTypePage;
