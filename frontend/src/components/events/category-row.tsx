'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Event } from '@/types/event';
import { EventCard } from './event-card';
import { buildScrollerMask, MIN_SCROLL_PX } from '@/lib/category-row';
import { cn } from '@/lib/utils';

interface CategoryRowProps {
  title: string;
  events: Event[];
  viewAllHref?: string;
}

export const CategoryRow = ({ title, events, viewAllHref }: CategoryRowProps) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanLeft(scrollLeft > 1);
      setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [events.length]);

  // Re-check on window resize too (font load / image load shifts)
  useEffect(() => {
    const onResize = () => {
      const el = scrollerRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanLeft(scrollLeft > 1);
      setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (events.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.max(MIN_SCROLL_PX, el.clientWidth * 0.8),
      behavior: 'smooth',
    });
  };

  const mask = buildScrollerMask(canLeft, canRight);

  return (
    <section className="group/row flex flex-col gap-3">
      <header className="flex items-end justify-between gap-3">
        <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all →
          </Link>
        )}
      </header>

      <div className="relative">
        {/* Scroll buttons — desktop only */}
        <button
          type="button"
          aria-label={`Scroll ${title} left`}
          onClick={() => scrollBy(-1)}
          disabled={!canLeft}
          className={cn(
            'hidden md:flex absolute left-0 top-1/2 z-10 size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
            'border border-white/40 bg-white/85 text-foreground shadow-lg shadow-black/10 backdrop-blur-md',
            'opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-0'
          )}
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label={`Scroll ${title} right`}
          onClick={() => scrollBy(1)}
          disabled={!canRight}
          className={cn(
            'hidden md:flex absolute right-0 top-1/2 z-10 size-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
            'border border-white/40 bg-white/85 text-foreground shadow-lg shadow-black/10 backdrop-blur-md',
            'opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-0'
          )}
        >
          <ChevronRight className="size-4" />
        </button>

        <div
          ref={scrollerRef}
          style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} variant="rail" />
          ))}
        </div>
      </div>
    </section>
  );
};
