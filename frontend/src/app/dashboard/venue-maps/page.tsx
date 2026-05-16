'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Map, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getVenueMaps, deleteVenueMap } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { dashboardVenueMapRoute } from '@/lib/routes';
import type { VenueMapSummaryDto } from '@/lib/api/types.gen';

export default function VenueMapsPage() {
  const { user } = useAuth();
  const [maps, setMaps] = useState<VenueMapSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVenueMaps().then(({ data }) => {
      if (data) setMaps(data as VenueMapSummaryDto[]);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this venue map? Events using it will keep their assignment but the map data will be lost.')) return;
    await deleteVenueMap({ path: { id } });
    setMaps((prev) => prev.filter((m) => m.id !== id));
  };

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <p className="text-sm text-muted-foreground">Only administrators can manage venue maps.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-foreground">
            Venue Maps
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage seating charts and floor plans shared across events.
          </p>
        </div>
        <Link href={dashboardVenueMapRoute('new')}>
          <Button className="gap-1.5">
            <Plus className="size-4" />
            New map
          </Button>
        </Link>
      </div>

      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : maps.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No venue maps yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Places</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {maps.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                    <td className="px-6 py-3 font-medium">{m.name}</td>
                    <td className="px-6 py-3">
                      <Badge variant="secondary">{m.placeCount} places</Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={dashboardVenueMapRoute(m.id)}>
                          <Button variant="ghost" size="icon-sm">
                            <Map className="size-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(m.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
