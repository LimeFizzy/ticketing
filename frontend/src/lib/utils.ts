import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const titleCase = (s: string) =>
  s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
