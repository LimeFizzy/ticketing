'use client';

import { useState } from 'react';

import {
  buildTicketTypeIndex,
  MAX_PLACES_PER_ORDER,
  setSelectionQuantity,
  totalSelected,
  type Selection,
} from '@/lib/buy-utils';
import { type EventDto } from '@/lib/api';

export interface UseTicketSelectionResult {
  selection: Selection;
  setQuantity: (id: string, next: number) => void;
  total: number;
  capRemaining: number;
  ticketTypeIndex: ReturnType<typeof buildTicketTypeIndex>;
  unitPriceFor: (ticketTypeId: string) => number;
  unitNameFor: (ticketTypeId: string) => string;
}

export const useTicketSelection = (
  event: EventDto
): UseTicketSelectionResult => {
  const [selection, setSelection] = useState<Selection>({});

  const ticketTypeIndex = buildTicketTypeIndex(event);

  const setQuantity = (id: string, next: number) =>
    setSelection((prev) => setSelectionQuantity(prev, id, next));

  const total = totalSelected(selection);
  const capRemaining = MAX_PLACES_PER_ORDER - total;

  const unitPriceFor = (ticketTypeId: string) =>
    ticketTypeIndex.get(ticketTypeId)?.price ?? 0;

  const unitNameFor = (ticketTypeId: string) =>
    ticketTypeIndex.get(ticketTypeId)?.name ?? 'Ticket';

  return {
    selection,
    setQuantity,
    total,
    capRemaining,
    ticketTypeIndex,
    unitPriceFor,
    unitNameFor,
  };
};
