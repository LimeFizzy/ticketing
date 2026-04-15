import { type VenueMap, type VenueMapPlace } from '@/types/venue-map';
import { EventDto } from './api';

export interface PlaceColor {
  fill: string;
  stroke: string;
}

export const TICKET_TYPE_PALETTE: PlaceColor[] = [
  { fill: '#7c3aed', stroke: '#5b21b6' }, // violet
  { fill: '#06b6d4', stroke: '#0e7490' }, // cyan
  { fill: '#f59e0b', stroke: '#b45309' }, // amber
  { fill: '#ec4899', stroke: '#9d174d' }, // pink
  { fill: '#10b981', stroke: '#047857' }, // emerald
];

export const SELECTED_FILL = '#1d4ed8';
export const SOLD_FILL = '#94a3b8';

export const buildTicketTypeColors = (
  event: EventDto
): Map<string, PlaceColor> => {
  const map = new Map<string, PlaceColor>();
  event.ticketTypes.forEach((t, i) => {
    map.set(t.id, TICKET_TYPE_PALETTE[i % TICKET_TYPE_PALETTE.length]);
  });
  return map;
};

const seatRow = (
  prefix: string,
  count: number,
  startX: number,
  y: number,
  spacing: number,
  ticketTypeId: string,
  soldIndices: number[] = []
): VenueMapPlace[] => {
  const out: VenueMapPlace[] = [];
  for (let i = 0; i < count; i++) {
    const sold = soldIndices.includes(i);
    out.push({
      id: `${prefix}-${i + 1}`,
      kind: 'seat',
      label: `${prefix.toUpperCase()}${i + 1}`,
      ticketTypeId,
      x: startX + i * spacing,
      y,
      capacity: 1,
      available: sold ? 0 : 1,
    });
  }
  return out;
};

const zalgirio: VenueMap = {
  id: 'vm-zalgirio',
  name: 'Žalgirio Arena',
  width: 1000,
  height: 600,
  decorations: [{ x: 350, y: 250, width: 300, height: 100, label: 'COURT' }],
  places: [
    // Courtside — 1 row of 8 (above court). A few sold for realism.
    ...seatRow(
      'cs',
      8,
      385,
      220,
      32,
      '00000000-0000-0000-0000-000000000023',
      [2, 5]
    ),

    // Lower tier — 3 rows × 12 seats (below court).
    ...seatRow(
      'lwr-a',
      12,
      320,
      400,
      35,
      '00000000-0000-0000-0000-000000000022',
      [3]
    ),
    ...seatRow(
      'lwr-b',
      12,
      320,
      430,
      35,
      '00000000-0000-0000-0000-000000000022',
      [7, 8]
    ),
    ...seatRow(
      'lwr-c',
      12,
      320,
      460,
      35,
      '00000000-0000-0000-0000-000000000022',
      []
    ),

    // Upper tier — 3 rows × 20 seats (outer ring).
    ...seatRow(
      'upr-a',
      20,
      150,
      495,
      35,
      '00000000-0000-0000-0000-000000000021',
      [4, 11]
    ),
    ...seatRow(
      'upr-b',
      20,
      150,
      525,
      35,
      '00000000-0000-0000-0000-000000000021',
      [0, 19]
    ),
    ...seatRow(
      'upr-c',
      20,
      150,
      555,
      35,
      '00000000-0000-0000-0000-000000000021',
      [9, 14, 15]
    ),
  ],
};

const lakeside: VenueMap = {
  id: 'vm-lakeside',
  name: 'Lakeside Park — Festival Grounds',
  width: 800,
  height: 400,
  decorations: [{ x: 250, y: 30, width: 300, height: 50, label: 'STAGE' }],
  places: [
    {
      id: 'vip-deck',
      kind: 'section',
      label: 'VIP Deck',
      ticketTypeId: '00000000-0000-0000-0000-000000000062',
      x: 300,
      y: 110,
      width: 200,
      height: 80,
      capacity: 50,
      available: 40,
    },
    {
      id: 'ga-floor',
      kind: 'section',
      label: 'General Admission',
      ticketTypeId: '00000000-0000-0000-0000-000000000061',
      x: 100,
      y: 220,
      width: 600,
      height: 140,
      capacity: 200,
      available: 150,
    },
  ],
};

export const VENUE_MAPS: VenueMap[] = [zalgirio, lakeside];

export const getVenueMap = (id: string): VenueMap | undefined =>
  VENUE_MAPS.find((m) => m.id === id);

export const totalAvailable = (map: VenueMap): number =>
  map.places.reduce((sum, p) => sum + p.available, 0);
