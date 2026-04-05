import { type Metadata } from 'next';
import { cookies } from 'next/headers';
import { type UserTicket } from '@/types/tickets';
import { getMyTickets } from '@/lib/api';
import { TicketsTabs } from '@/components/tickets/tickets-tabs';

export const metadata: Metadata = { title: 'My Tickets — TicketFlow' };

const TicketsPage = async () => {
  const cookieStore = await cookies();
  const { data, error } = await getMyTickets({
    headers: { Cookie: cookieStore.toString() },
  });
  if (error) throw error;

  const now = new Date();
  const tickets: UserTicket[] = (data ?? []).map((t) => ({
    ...t,
    isPast: new Date(t.eventDate) < now,
  }));

  const upcoming = tickets.filter((t) => !t.isPast);
  const past = tickets.filter((t) => t.isPast);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Tickets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your purchased event tickets
        </p>
      </div>

      <TicketsTabs upcoming={upcoming} past={past} />
    </div>
  );
};

export default TicketsPage;
