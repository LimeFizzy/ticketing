import { SearchX } from 'lucide-react';
import { type Event } from '@/types/event';
import { EventCard } from './event-card';

export const EventsGrid = ({ events }: { events: Event[] }) => {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
        <SearchX className="size-10 opacity-40" />
        <p className="text-sm">No events found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
