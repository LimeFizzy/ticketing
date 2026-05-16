import { EventDto, EventTicketTypeDto } from './api';

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
  event: EventDto
): Map<string, EventTicketTypeDto> =>
  new Map(event.ticketTypes.map((t) => [t.id, t]));

export const ticketTypeNameFromIndex = (
  index: Map<string, EventTicketTypeDto>,
  id: string
): string => index.get(id)?.name ?? 'Ticket';

export const ticketTypePriceFromIndex = (
  index: Map<string, EventTicketTypeDto>,
  id: string
): number => index.get(id)?.price ?? 0;

export const selectionKey = (eventId: string) => `tf:sel:${eventId}`;

export const saveSelection = (eventId: string, selection: Selection) => {
  sessionStorage.setItem(selectionKey(eventId), JSON.stringify(selection));
};

export const restoreSelection = (eventId: string): Selection | null => {
  const key = selectionKey(eventId);
  const saved = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as Selection;
  } catch {
    return null;
  }
};
