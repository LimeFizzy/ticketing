import { Suspense } from 'react';
import { type Metadata } from 'next';
import { getEvents } from '@/lib/api';
import { filterEvents, hasActiveFilter, trending } from '@/lib/event-filters';
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
  const { data: events, error } = await getEvents();
  if (error) throw error;

  const eventList = events ?? [];

  const filtered = filterEvents(eventList, params);
  const isFiltered = hasActiveFilter(params);

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
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        <EventsGrid events={filtered} />
      </section>
    </div>
  );
};

export default DashboardPage;
