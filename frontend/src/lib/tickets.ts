import { type Event } from '@/types/event';
import { type UserTicket } from '@/types/tickets';

export const USER_TICKET_IDS = ['1', '2', '3', '6'];

export const getUserTickets = (
  events: Event[],
  today: Date
): { upcoming: UserTicket[]; past: UserTicket[] } => {
  const tickets: UserTicket[] = events
    .filter((event) => USER_TICKET_IDS.includes(event.id))
    .map((event, i) => ({
      event,
      ticketId: `TF-${String(1000 + i).padStart(4, '0')}`,
      isPast: new Date(event.date) < today,
    }));

  return {
    upcoming: tickets.filter((t) => !t.isPast),
    past: tickets.filter((t) => t.isPast),
  };
};

export const getUserTicketById = (
  events: Event[],
  today: Date,
  ticketId: string
): UserTicket | undefined => {
  const { upcoming, past } = getUserTickets(events, today);
  return [...upcoming, ...past].find((t) => t.ticketId === ticketId);
};
