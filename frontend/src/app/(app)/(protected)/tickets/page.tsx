import { type Metadata } from 'next';
import { getEvents } from '@/lib/api';
import { getUserTickets } from '@/lib/tickets';
import { TicketsTabs } from '@/components/tickets/tickets-tabs';

export const metadata: Metadata = { title: 'My Tickets — TicketFlow' };

const TicketsPage = async () => {
  const { data, error } = await getEvents();
  if (error) throw error;
  
  const { upcoming, past } = getUserTickets(data ?? [], new Date());

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
