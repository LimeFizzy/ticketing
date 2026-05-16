'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Search, Tag, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORY_LABELS, DATE_LABELS, PRICE_LABELS } from '@/lib/event-styles';
import { Route } from '@/lib/routes';

export const FilterBar = () => {
  const router = useRouter();
  const params = useSearchParams();

  const searchValue = params.get('q') ?? '';
  const [draft, setDraft] = useState(searchValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setDraft(searchValue);
  }, [searchValue]);

  const update = useCallback((key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    const qs = next.toString();
    router.replace(qs ? `${Route.Home}?${qs}` : Route.Home);
  }, [params, router]);

  const handleSearchChange = useCallback((value: string) => {
    setDraft(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update('q', value || null), 300);
  }, [update]);

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Search */}
      <div className="relative min-w-52 flex-1 sm:min-w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search events, locations, cities…"
          value={draft}
          className="h-10 rounded-xl bg-white/60 border-border pl-9 backdrop-blur-md"
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Category */}
      <Select
        value={params.get('category') ?? 'all'}
        onValueChange={(value) => update('category', String(value ?? 'all'))}
      >
        <SelectTrigger className="h-10 w-full rounded-xl bg-white/60 border-border backdrop-blur-md sm:w-44">
          <Tag className="size-3.5 text-muted-foreground" />
          <SelectValue>
            {(value) =>
              CATEGORY_LABELS[String(value ?? 'all')] ?? 'All categories'
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          <SelectItem value="Music">Music</SelectItem>
          <SelectItem value="Sports">Sports</SelectItem>
          <SelectItem value="Theater">Theater</SelectItem>
        </SelectContent>
      </Select>

      {/* Date */}
      <Select
        value={params.get('date') ?? 'all'}
        onValueChange={(value) => update('date', String(value ?? 'all'))}
      >
        <SelectTrigger className="h-10 w-full rounded-xl bg-white/60 border-border backdrop-blur-md sm:w-40">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          <SelectValue>
            {(value) => DATE_LABELS[String(value ?? 'all')] ?? 'Any date'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any date</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This week</SelectItem>
          <SelectItem value="month">This month</SelectItem>
        </SelectContent>
      </Select>

      {/* Price */}
      <Select
        value={params.get('price') ?? 'all'}
        onValueChange={(value) => update('price', String(value ?? 'all'))}
      >
        <SelectTrigger className="h-10 w-full rounded-xl bg-white/60 border-border backdrop-blur-md sm:w-40">
          <Wallet className="size-3.5 text-muted-foreground" />
          <SelectValue>
            {(value) => PRICE_LABELS[String(value ?? 'all')] ?? 'Any price'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any price</SelectItem>
          <SelectItem value="under20">Under €20</SelectItem>
          <SelectItem value="under60">Under €60</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
