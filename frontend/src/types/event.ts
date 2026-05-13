import type { EventDto, EventTicketTypeDto } from '@/lib/api/types.gen';

export type OrganizerTicketTypeDto = EventTicketTypeDto & {
  capacity: number;
  sold: number;
};

// Organizer view of an event: shared identity and content fields from EventDto,
// plus status (published/draft) and ticket types enriched with capacity/sales data.
export type OrganizerEventDto = Pick<
  EventDto,
  | 'id'
  | 'title'
  | 'category'
  | 'date'
  | 'venue'
  | 'city'
  | 'description'
  | 'imageUrl'
> & {
  status: 'published' | 'draft';
  ticketTypes: OrganizerTicketTypeDto[];
};
