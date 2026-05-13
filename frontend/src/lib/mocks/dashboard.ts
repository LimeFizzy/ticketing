import type { EventCategory } from '@/lib/api/types.gen';
import type { OrganizerEventDto, OrganizerTicketTypeDto } from '@/types/event';

/** Emails that are treated as organizers while the real role API is absent. */
export const MOCK_ORGANIZER_EMAILS = new Set([
  'organizer@ticketflow.lt',
  'leonardas.sinkevicius@kiloverse.com',
]);

export type { EventCategory };
export type { OrganizerEventDto as OrganizerEvent };
export type { OrganizerTicketTypeDto as OrganizerTicketType };

export const CATEGORIES: EventCategory[] = [
  'Music',
  'Sports',
  'Theater',
  'Comedy',
  'Festival',
  'Conference',
  'Workshop',
  'Other',
];

const seed: OrganizerEventDto[] = [
  {
    id: 'de000000-0000-0000-0000-000000000001',
    title: 'Vilnius Jazz Festival 2026',
    category: 'Music',
    date: '2026-06-20T19:00:00',
    venue: 'Vilnius Congress Concert Hall',
    city: 'Vilnius',
    description:
      'Three nights of world-class jazz in the heart of the Old Town. Featuring Lithuanian and international acts across two stages.',
    imageUrl:
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
    status: 'published',
    ticketTypes: [
      {
        id: 'dt000000-0000-0000-0000-000000000011',
        name: 'General Admission',
        price: 25,
        capacity: 400,
        sold: 212,
        description: 'Standing area, all stages',
      },
      {
        id: 'dt000000-0000-0000-0000-000000000012',
        name: 'VIP',
        price: 65,
        capacity: 60,
        sold: 38,
        description: 'Reserved seating, complimentary drinks',
      },
    ],
  },
  {
    id: 'de000000-0000-0000-0000-000000000002',
    title: 'Žalgiris vs CSKA Moscow',
    category: 'Sports',
    date: '2026-05-28T18:30:00',
    venue: 'Žalgirio Arena',
    city: 'Kaunas',
    description:
      'EuroLeague playoff semi-final. One of the greatest rivalries in European basketball returns to the Žalgirio Arena.',
    imageUrl:
      'https://images.unsplash.com/photo-1546519638405-a9e13a9e8e03?w=800&q=80',
    status: 'published',
    ticketTypes: [
      {
        id: 'dt000000-0000-0000-0000-000000000021',
        name: 'Upper Tier',
        price: 18,
        capacity: 800,
        sold: 724,
      },
      {
        id: 'dt000000-0000-0000-0000-000000000022',
        name: 'Lower Tier',
        price: 35,
        capacity: 300,
        sold: 300,
        description: 'Sold out',
      },
      {
        id: 'dt000000-0000-0000-0000-000000000023',
        name: 'Courtside',
        price: 120,
        capacity: 40,
        sold: 22,
        description: 'Floor-level seats',
      },
    ],
  },
  {
    id: 'de000000-0000-0000-0000-000000000003',
    title: 'Hamlet — National Drama Theatre',
    category: 'Theater',
    date: '2026-07-10T19:30:00',
    venue: 'Lithuanian National Drama Theatre',
    city: 'Vilnius',
    description:
      "A reimagined production of Shakespeare's Hamlet directed by Oskaras Koršunovas. Performed in Lithuanian with English surtitles.",
    imageUrl:
      'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
    status: 'draft',
    ticketTypes: [
      {
        id: 'dt000000-0000-0000-0000-000000000031',
        name: 'Standard',
        price: 22,
        capacity: 200,
        sold: 0,
      },
      {
        id: 'dt000000-0000-0000-0000-000000000032',
        name: 'Premium',
        price: 38,
        capacity: 80,
        sold: 0,
        description: 'Front 10 rows',
      },
    ],
  },
];

const _events: OrganizerEventDto[] = seed.map((e) => ({
  ...e,
  ticketTypes: e.ticketTypes.map((t) => ({ ...t })),
}));

export const getOrganizerEvents = (): OrganizerEventDto[] => [..._events];

export const getOrganizerEvent = (id: string): OrganizerEventDto | undefined =>
  _events.find((e) => e.id === id);

export const createOrganizerEvent = (event: OrganizerEventDto): void => {
  _events.push(event);
};

export const updateOrganizerEvent = (
  id: string,
  patch: Omit<OrganizerEventDto, 'id'>
): void => {
  const idx = _events.findIndex((e) => e.id === id);
  if (idx >= 0) _events[idx] = { id, ...patch };
};

export const deleteOrganizerEvent = (id: string): void => {
  const idx = _events.findIndex((e) => e.id === id);
  if (idx >= 0) _events.splice(idx, 1);
};
