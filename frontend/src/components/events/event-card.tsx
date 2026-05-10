import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type Event } from '@/types/event';
import { CATEGORY_COLORS } from '@/lib/event-styles';
import { formatEventDateShort, formatPriceFrom } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'rail';
}

export const EventCard = ({ event, variant = 'default' }: EventCardProps) => {
  const isRail = variant === 'rail';

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        'group flex h-full focus:outline-none',
        isRail && 'w-[240px] shrink-0 snap-start sm:w-[260px]'
      )}
    >
      <Card
        className={cn(
          'glass flex h-full w-full flex-col overflow-hidden border-white/50 bg-card/80 rounded-2xl shadow-sm transition-all duration-200',
          'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5',
          'focus-within:ring-2 focus-within:ring-ring p-0 gap-0'
        )}
      >
        {/* Cover image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes={
              isRail
                ? '260px'
                : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
            }
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {/* gradient veil for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* category chip — top-left */}
          <span
            className={cn(
              'absolute left-2.5 top-2.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide backdrop-blur-md',
              CATEGORY_COLORS[event.category]
            )}
          >
            {event.category}
          </span>

          {/* price chip — bottom-left overlay */}
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md">
            {formatPriceFrom(event.priceFrom)}
          </span>
        </div>

        <CardContent className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3 shrink-0" />
              <span className="truncate">{formatEventDateShort(event.date)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </span>
          </div>

          <div className="mt-auto pt-1 text-[10px] text-muted-foreground/80">
            {event.availableTickets.toLocaleString()} tickets left
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
