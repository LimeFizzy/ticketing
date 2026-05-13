'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import { deleteVenueMap } from '@/lib/api';
import { useLocalSearch } from '@/hooks/use-local-search';
import { dashboardVenueMapRoute } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { VenueMapSummaryDto } from '@/lib/api/types.gen';

export function VenueMapsClient({
  initialMaps,
}: {
  initialMaps: VenueMapSummaryDto[];
}) {
  const router = useRouter();
  const [maps, setMaps] = useState(initialMaps);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch, filtered] = useLocalSearch(maps, (m, q) =>
    m.name.toLowerCase().includes(q)
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (
      !confirm(
        'Delete this venue map? Events using it will keep their assignment but the map data will be lost.'
      )
    )
      return;
    setDeletingId(id);
    await deleteVenueMap({ path: { id } });
    setMaps((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-foreground">
            Venue Maps
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage seating charts and floor plans shared across events.
          </p>
        </div>
        <Link
          href={dashboardVenueMapRoute('new')}
          className={cn(buttonVariants(), 'gap-1.5')}
        >
          <Plus className="size-4" />
          New map
        </Link>
      </div>

      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search venue maps…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <TooltipProvider>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Places</th>
                    <th className="pb-2 font-medium sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center">
                        {maps.length === 0 ? (
                          <div className="flex flex-col items-center gap-3">
                            <p className="text-muted-foreground">
                              No venue maps yet.
                            </p>
                            <Link
                              href={dashboardVenueMapRoute('new')}
                              className={buttonVariants({
                                variant: 'default',
                                size: 'sm',
                              })}
                            >
                              Create your first map
                            </Link>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No venue maps match your search.
                          </p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() =>
                          router.push(dashboardVenueMapRoute(m.id))
                        }
                        className="cursor-pointer transition-colors hover:bg-muted/40"
                      >
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {m.name}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          <Badge variant="secondary">
                            {m.placeCount} places
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip label="Delete">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => handleDelete(e, m.id)}
                                disabled={deletingId === m.id}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                {deletingId === m.id ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TooltipProvider>

          {search.trim() && (
            <p className="text-xs text-muted-foreground">
              {filtered.length} of {maps.length} venue map
              {maps.length !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
