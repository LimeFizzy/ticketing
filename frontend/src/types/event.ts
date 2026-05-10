export type EventCategory = 'Music' | 'Sports' | 'Theater';

export interface EventTicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  venue: string;
  city: string;
  priceFrom: number;
  ticketTypes: EventTicketType[];
  imageUrl: string;
  description: string;
  availableTickets: number;
  featured: boolean;
  disclaimers?: string[];
  venueMapId?: string;
}
