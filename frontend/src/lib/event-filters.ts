import { type EventCategory, EventDto } from './api';
import { type CategoryFilter, type SearchParams } from '@/types/filters';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const filterEvents = (
  events: EventDto[],
  params: SearchParams
): EventDto[] =>
  events.filter((event) => {
    const eventDate = new Date(event.date);

    if (params.q) {
      const q = params.q.toLowerCase();
      const match =
        event.title.toLowerCase().includes(q) ||
        event.venue.toLowerCase().includes(q) ||
        event.city.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (params.category && params.category !== 'all') {
      if (event.category !== (params.category as CategoryFilter)) return false;
    }

    if (params.date && params.date !== 'all') {
      const TODAY = new Date();
      const days = (eventDate.getTime() - TODAY.getTime()) / MS_PER_DAY;
      if (params.date === 'today' && (days < 0 || days >= 1)) return false;
      if (params.date === 'week' && (days < 0 || days > 7)) return false;
      if (params.date === 'month' && (days < 0 || days > 30)) return false;
    }

    if (params.price && params.price !== 'all') {
      if (params.price === 'under20' && event.priceFrom > 20) return false;
      if (params.price === 'under60' && event.priceFrom > 60) return false;
    }

    return true;
  });

export const hasActiveFilter = (params: SearchParams): boolean =>
  Boolean(
    (params.q && params.q.trim().length > 0) ||
    (params.category && params.category !== 'all') ||
    (params.date && params.date !== 'all') ||
    (params.price && params.price !== 'all')
  );

export const buildEventsQuery = (params: SearchParams) => {
  const query: {
    search?: string;
    category?: EventCategory;
    date?: string;
    price?: string;
  } = {};
  if (params.q?.trim()) query.search = params.q.trim();
  if (params.category && params.category !== 'all')
    query.category = params.category as EventCategory;
  if (params.date && params.date !== 'all') query.date = params.date;
  if (params.price && params.price !== 'all') query.price = params.price;
  return Object.keys(query).length > 0 ? query : undefined;
};

export const trending = (events: EventDto[]): EventDto[] =>
  [...events]
    .sort((a, b) => b.availableTickets - a.availableTickets)
    .slice(0, 6);
