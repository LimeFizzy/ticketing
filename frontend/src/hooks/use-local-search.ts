import { useMemo, useState } from 'react';

export function useLocalSearch<T>(
  items: T[],
  predicate: (item: T, query: string) => boolean
): [string, React.Dispatch<React.SetStateAction<string>>, T[]] {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => predicate(item, q));
  }, [items, query, predicate]);

  return [query, setQuery, filtered];
}
