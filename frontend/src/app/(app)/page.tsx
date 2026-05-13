import { Suspense } from 'react';
import { type Metadata } from 'next';
import { type EventCategory } from '@/lib/api';
import { getCachedEvents } from '@/lib/event-cache';
import { hasActiveFilter, trending } from '@/lib/event-filters';
import { type SearchParams } from '@/types/filters';
import { EventsGrid } from '@/components/events/events-grid';
import { FilterBar } from '@/components/events/filter-bar';
import { CategoryRow } from '@/components/events/category-row';

export const metadata: Metadata = { title: 'Events — TicketFlow' };

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const params = await searchParams;
  const isFiltered = hasActiveFilter(params);

  // Build API query from active filters
  const query: NonNullable<Parameters<typeof getCachedEvents>[0]> = {};
  if (params.q?.trim()) query.search = params.q.trim();
  if (params.category && params.category !== 'all') query.category = params.category as EventCategory;
  if (params.date && params.date !== 'all') query.date = params.date;
  if (params.price && params.price !== 'all') query.price = params.price;

  const { data: events, error } = await getCachedEvents(
    Object.keys(query).length > 0 ? query : undefined
  );
  if (error) throw error;

  const eventList = events ?? [];

  const featured = eventList.filter((e) => e.featured);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-4 py-6 md:px-8 md:py-10">
      {/* Hero */}
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-foreground md:text-6xl">
          Discover events
          <br />
          <span className="italic text-primary">across Lithuania</span>
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground md:text-base">
          Concerts, sports, and theatre — handpicked, all in one place.
        </p>
      </header>

      {/* Rails — only when no filter is active */}
      {!isFiltered && (
        <div className="flex flex-col gap-10">
          <CategoryRow title="Featured" events={featured} />
          <CategoryRow title="Trending now" events={trending(eventList)} />
        </div>
      )}

      {/* Filter dashboard + grid */}
      <section className="flex flex-col gap-5">
        <div className="sticky top-[4.25rem] z-20 -mx-1 rounded-2xl border border-white/60 bg-white/80 p-3 shadow-md shadow-black/5 glass md:top-3">
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            {isFiltered ? 'Results' : 'All events'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {eventList.length} event{eventList.length !== 1 ? 's' : ''}
          </p>
        </div>

        <EventsGrid events={eventList} />
      </section>
    </div>
  );
};

export default DashboardPage;
