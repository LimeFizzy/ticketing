import { unstable_cache } from 'next/cache';
import { getEvents } from './api';

type EventsQuery = NonNullable<Parameters<typeof getEvents>[0]>['query'];

export const getCachedEvents = (query?: EventsQuery) =>
  unstable_cache(
    () => getEvents(query ? { query } : undefined),
    ['events', JSON.stringify(query ?? {})],
    { revalidate: 60, tags: ['events'] }
  )();
