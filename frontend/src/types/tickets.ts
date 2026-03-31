import { EventDto } from "@/lib/api";

export type Tab = 'upcoming' | 'past';

export interface UserTicket {
  event: EventDto;
  ticketId: string;
  isPast: boolean;
}
