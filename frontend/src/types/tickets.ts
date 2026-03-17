import { type Event } from '@/types/event';

export type Tab = 'upcoming' | 'past';

export interface UserTicket {
  event: Event;
  ticketId: string;
  isPast: boolean;
}
