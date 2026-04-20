'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Link2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { buttonVariants, Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { deleteEvent, getEvents } from '@/lib/api';
import type { EventCategory, EventDto } from '@/lib/api/types.gen';
import { CATEGORIES } from '@/types/event';
import {
  dashboardEventRoute,
  dashboardEventsNewRoute,
  eventRoute,
} from '@/lib/routes';
import { formatEventDateShort } from '@/lib/formatters';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'published' | 'draft';

const filterEvents = (
  events: EventDto[],
  search: string,
  status: StatusFilter,
  category: EventCategory | 'all'
): EventDto[] => {
  const q = search.trim().toLowerCase();
  return events.filter((e) => {
    if (
      q &&
      !e.title.toLowerCase().includes(q) &&
      !e.venue.toLowerCase().includes(q) &&
      !e.city.toLowerCase().includes(q)
    )
      return false;
    if (status !== 'all' && e.status !== status) return false;
    if (category !== 'all' && e.category !== category) return false;
    return true;
  });
};

const DashboardPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [category, setCategory] = useState<EventCategory | 'all'>('all');

  useEffect(() => {
    if (!user) return;
    getEvents({ query: { organizerId: user.id } })
      .then(({ data }) => {
        if (data) setEvents(data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(
    () => filterEvents(events, search, status, category),
    [events, search, status, category]
  );

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      await deleteEvent({ path: { id } });
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    },
    []
  );

  const handleShare = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}${eventRoute(id)}`;
    navigator.clipboard.writeText(url);
  }, []);

  const handleEdit = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      router.push(dashboardEventRoute(id));
    },
    [router]
  );

  if (loading) return null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          My Events
        </h1>
        <Link
          href={dashboardEventsNewRoute()}
          className={cn(buttonVariants(), 'gap-2')}
        >
          <Plus className="size-4" />
          New event
        </Link>
      </div>

      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, venue, city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={status}
              onValueChange={(v) => setStatus(v as StatusFilter)}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue>
                  {() =>
                    status === 'all'
                      ? 'All statuses'
                      : status === 'published'
                        ? 'Published'
                        : 'Draft'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={category}
              onValueChange={(v) => setCategory(v as EventCategory | 'all')}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue>
                  {() => (category === 'all' ? 'All categories' : category)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Title</th>
                  <th className="pb-2 pr-4 font-medium">Category</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Venue</th>
                  <th className="pb-2 pr-4 text-right font-medium">
                    Tickets sold
                  </th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No events match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((event) => {
                    const { totalCapacity, totalSold } =
                      event.ticketTypes.reduce(
                        (acc, t) => ({
                          totalCapacity: acc.totalCapacity + t.capacity,
                          totalSold: acc.totalSold + t.sold,
                        }),
                        { totalCapacity: 0, totalSold: 0 }
                      );
                    return (
                      <tr
                        key={event.id}
                        onClick={() =>
                          router.push(dashboardEventRoute(event.id))
                        }
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                      >
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {event.title}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {event.category}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                          {formatEventDateShort(event.date)}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          <span className="line-clamp-1">
                            {event.venue}, {event.city}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                          {totalSold} / {totalCapacity}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant={
                              event.status === 'published'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {event.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Copy public link"
                              onClick={(e) => handleShare(e, event.id)}
                            >
                              <Link2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Edit event"
                              onClick={(e) => handleEdit(e, event.id)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Delete event"
                              onClick={(e) => handleDelete(e, event.id)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            {filtered.length} of {events.length} event
            {events.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {events.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="text-muted-foreground">No events yet.</p>
          <Link
            href={dashboardEventsNewRoute()}
            className={buttonVariants({ variant: 'outline' })}
          >
            Create your first event
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
