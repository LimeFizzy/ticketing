import { type Event, type EventTicketType } from '@/types/event';

export const MAX_PLACES_PER_ORDER = 8;

export type Selection = Record<string, number>;

export const totalSelected = (selection: Selection): number =>
  Object.values(selection).reduce((sum, n) => sum + n, 0);

export const setSelectionQuantity = (
  prev: Selection,
  id: string,
  next: number
): Selection => {
  const updated = { ...prev };
  if (next <= 0) delete updated[id];
  else updated[id] = next;
  return updated;
};

export interface TicketTypeInfo {
  name: string;
  price: number;
  description?: string;
}

export const buildTicketTypeIndex = (
  event: Event
): Map<string, EventTicketType> =>
  new Map(event.ticketTypes.map((t) => [t.id, t]));

export const ticketTypeNameFromIndex = (
  index: Map<string, EventTicketType>,
  id: string
): string => index.get(id)?.name ?? 'Ticket';

export const ticketTypePriceFromIndex = (
  index: Map<string, EventTicketType>,
  id: string
): number => index.get(id)?.price ?? 0;
