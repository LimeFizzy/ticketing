'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { restoreSelection } from '@/lib/buy-utils';

export const useRestoreSelection = (
  eventId: string,
  setQuantity: (id: string, qty: number) => void
) => {
  const setQuantityRef = useRef(setQuantity);
  useLayoutEffect(() => {
    setQuantityRef.current = setQuantity;
  });

  useEffect(() => {
    const saved = restoreSelection(eventId);
    if (!saved) return;
    Object.entries(saved).forEach(([id, qty]) =>
      setQuantityRef.current(id, qty)
    );
  }, [eventId]);
};
