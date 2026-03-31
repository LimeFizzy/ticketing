import { EventCategory } from "./api";

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  Music: 'bg-blue-500/15 text-blue-700 border-blue-300/40',
  Sports: 'bg-emerald-500/15 text-emerald-700 border-emerald-300/40',
  Theater: 'bg-purple-500/15 text-purple-700 border-purple-300/40',
  Comedy: 'bg-yellow-500/15 text-yellow-700 border-yellow-300/40',
  Festival: 'bg-pink-500/15 text-pink-700 border-pink-300/40',
  Conference: 'bg-cyan-500/15 text-cyan-700 border-cyan-300/40',
  Workshop: 'bg-orange-500/15 text-orange-700 border-orange-300/40',
  Other: 'bg-gray-500/15 text-gray-700 border-gray-300/40',
};

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'All categories',
  Music: 'Music',
  Sports: 'Sports',
  Theater: 'Theater',
  Comedy: 'Comedy',
  Festival: 'Festival',
  Conference: 'Conference',
  Workshop: 'Workshop',
  Other: 'Other',
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
