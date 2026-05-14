export type Tab = 'upcoming' | 'past';

export interface UserTicket {
  id: string;
  ticketCode: string;
  eventId: string;
  eventTicketTypeId: string;
  eventTitle: string;
  ticketTypeName: string;
  pricePaid: number;
  status: string;
  eventDate: string;
  venue: string;
  city: string;
  imageUrl: string;
  checkedInAt?: string | null;
  isPast: boolean;
}
