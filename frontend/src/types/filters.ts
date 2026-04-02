import { EventCategory } from '@/lib/api';

export interface SearchParams {
  q?: string;
  category?: string;
  date?: string;
  price?: string;
}

export type CategoryFilter = 'all' | EventCategory;
export type DateFilter = 'all' | 'today' | 'week' | 'month';
export type PriceFilter = 'all' | 'under20' | 'under60';
