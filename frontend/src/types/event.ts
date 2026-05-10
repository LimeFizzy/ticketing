export type EventCategory = 'Music' | 'Sports' | 'Theater';

export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  venue: string;
  city: string;
  price: number;
  imageUrl: string;
  description: string;
  availableTickets: number;
  featured: boolean;
}
