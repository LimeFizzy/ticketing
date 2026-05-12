'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  buildTicketTypeIndex,
  MAX_PLACES_PER_ORDER,
  setSelectionQuantity,
  totalSelected,
  type Selection,
} from '@/lib/buy-utils';
import { EventDto } from '@/lib/api/types.gen';

export interface UseTicketSelectionResult {
  selection: Selection;
  setQuantity: (id: string, next: number) => void;
  total: number;
  capRemaining: number;
  ticketTypeIndex: ReturnType<typeof buildTicketTypeIndex>;
  unitPriceFor: (ticketTypeId: string) => number;
  unitNameFor: (ticketTypeId: string) => string;
}

export const useTicketSelection = (event: EventDto): UseTicketSelectionResult => {
  const [selection, setSelection] = useState<Selection>({});

  const ticketTypeIndex = useMemo(() => buildTicketTypeIndex(event), [event]);

  const setQuantity = useCallback(
    (id: string, next: number) =>
      setSelection((prev) => setSelectionQuantity(prev, id, next)),
    []
  );

  const total = totalSelected(selection);
  const capRemaining = MAX_PLACES_PER_ORDER - total;

  const unitPriceFor = useCallback(
    (ticketTypeId: string) => ticketTypeIndex.get(ticketTypeId)?.price ?? 0,
    [ticketTypeIndex]
  );

  const unitNameFor = useCallback(
    (ticketTypeId: string) =>
      ticketTypeIndex.get(ticketTypeId)?.name ?? 'Ticket',
    [ticketTypeIndex]
  );

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
