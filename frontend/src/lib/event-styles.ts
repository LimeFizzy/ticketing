import { type EventCategory } from '@/types/event';

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  Music: 'bg-blue-500/15 text-blue-700 border-blue-300/40',
  Sports: 'bg-emerald-500/15 text-emerald-700 border-emerald-300/40',
  Theater: 'bg-purple-500/15 text-purple-700 border-purple-300/40',
};

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'All categories',
  Music: 'Music',
  Sports: 'Sports',
  Theater: 'Theater',
};

export const DATE_LABELS: Record<string, string> = {
  all: 'Any date',
  today: 'Today',
  week: 'This week',
  month: 'This month',
};

export const PRICE_LABELS: Record<string, string> = {
  all: 'Any price',
  under20: 'Under €20',
  under60: 'Under €60',
};
