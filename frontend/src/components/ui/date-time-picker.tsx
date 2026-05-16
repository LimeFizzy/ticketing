'use client';

import { Popover } from '@base-ui/react/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function toInputValue(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function firstWeekdayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon=0 … Sun=6
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDisplay(date: Date): string {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  className,
}: DateTimePickerProps) {
  const selected = value ? new Date(value) : null;
  const now = new Date();

  const [viewYear, setViewYear] = useState(
    selected?.getFullYear() ?? now.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    selected?.getMonth() ?? now.getMonth()
  );

  const offset = firstWeekdayOfMonth(viewYear, viewMonth);
  const dim = daysInMonth(viewYear, viewMonth);
  const prevDim = daysInMonth(viewYear, viewMonth - 1);
  const totalCells = Math.ceil((offset + dim) / 7) * 7;

  const hour = String((selected ?? now).getHours()).padStart(2, '0');
  const minute = String((selected ?? now).getMinutes()).padStart(2, '0');

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const selectDay = (day: number, month: number, year: number) => {
    const current = new Date();
    const h = selected?.getHours() ?? current.getHours();
    const m = selected?.getMinutes() ?? current.getMinutes();
    onChange(toInputValue(new Date(year, month, day, h, m)));
  };

  const changeTime = (field: 'h' | 'm', raw: string) => {
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const base = selected ?? new Date(viewYear, viewMonth, 1);
    const d = new Date(base);
    if (field === 'h') d.setHours(Math.max(0, Math.min(23, num)));
    else d.setMinutes(Math.max(0, Math.min(59, num)));
    onChange(toInputValue(d));
  };

  return (
    <Popover.Root>
      <Popover.Trigger
        className={cn(
          'h-8 w-full min-w-0 rounded-lg border border-border bg-white/70 px-2.5 py-1',
          'flex items-center gap-2 text-sm outline-none transition-colors',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          'aria-expanded:border-ring aria-expanded:ring-3 aria-expanded:ring-ring/50',
          !selected && 'text-muted-foreground',
          className
        )}
      >
        <CalendarIcon className="size-3.5 shrink-0 opacity-50" />
        {selected ? formatDisplay(selected) : 'Pick a date & time'}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={6} align="start">
          <Popover.Popup
            className={cn(
              'glass z-50 w-72 rounded-xl border border-white/40 bg-popover p-3',
              'shadow-lg shadow-black/8 outline-none',
              'transition-all duration-150 ease-out',
              'data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0',
              'data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0'
            )}
          >
            {/* Month navigation */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-medium">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="mb-1 grid grid-cols-7">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="flex h-7 items-center justify-center text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {Array.from({ length: totalCells }, (_, i) => {
                let day: number;
                let month = viewMonth;
                let year = viewYear;
                let current = true;

                if (i < offset) {
                  day = prevDim - offset + i + 1;
                  month = viewMonth === 0 ? 11 : viewMonth - 1;
                  year = viewMonth === 0 ? viewYear - 1 : viewYear;
                  current = false;
                } else if (i >= offset + dim) {
                  day = i - offset - dim + 1;
                  month = viewMonth === 11 ? 0 : viewMonth + 1;
                  year = viewMonth === 11 ? viewYear + 1 : viewYear;
                  current = false;
                } else {
                  day = i - offset + 1;
                }

                const isSelected =
                  selected?.getFullYear() === year &&
                  selected?.getMonth() === month &&
                  selected?.getDate() === day;
                const isToday =
                  now.getFullYear() === year &&
                  now.getMonth() === month &&
                  now.getDate() === day &&
                  current;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectDay(day, month, year)}
                    className={cn(
                      'flex h-7 w-full items-center justify-center rounded-md text-sm transition-colors',
                      isSelected
                        ? 'bg-primary font-medium text-primary-foreground'
                        : isToday
                          ? 'bg-accent font-medium text-accent-foreground'
                          : current
                            ? 'text-foreground hover:bg-muted'
                            : 'text-muted-foreground/40 hover:bg-muted/50'
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Time picker */}
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Time</span>
              <div className="ml-auto flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={(e) => changeTime('h', e.target.value)}
                  className={cn(
                    'w-10 rounded-md border border-border bg-white/70 px-1.5 py-0.5',
                    'text-center text-sm outline-none transition-colors',
                    'focus:border-ring focus:ring-2 focus:ring-ring/50',
                    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                  )}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  :
                </span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={(e) => changeTime('m', e.target.value)}
                  className={cn(
                    'w-10 rounded-md border border-border bg-white/70 px-1.5 py-0.5',
                    'text-center text-sm outline-none transition-colors',
                    'focus:border-ring focus:ring-2 focus:ring-ring/50',
                    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                  )}
                />
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
