import { type EventDto } from './api';

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
