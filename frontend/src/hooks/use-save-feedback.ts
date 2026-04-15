import { useCallback, useEffect, useRef, useState } from 'react';

export const useSaveFeedback = () => {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showSaved = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaved(true);
    timerRef.current = setTimeout(() => setSaved(false), 1500);
  }, []);

  return { saved, showSaved };
};
