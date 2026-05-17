'use client';

import { Loader2 } from 'lucide-react';
import type { VenueMapSummaryDto } from '@/lib/api/types.gen';
import { cn } from '@/lib/utils';

interface VenueMapStep1Props {
  loading: boolean;
  allMaps: VenueMapSummaryDto[];
  selectedMapId: string | null;
  onSelect: (id: string | null) => void;
}

export const VenueMapStep1 = ({
  loading,
  allMaps,
  selectedMapId,
  onSelect,
}: VenueMapStep1Props) => (
  <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
    {loading ? (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ) : (
      <>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
            selectedMapId === null
              ? 'border-primary bg-primary/10'
              : 'border-border hover:bg-muted/30'
          )}
        >
          <span className="text-sm font-medium text-foreground">
            No venue map
          </span>
        </button>
        {allMaps.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            className={cn(
              'flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors',
              selectedMapId === m.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-muted/30'
            )}
          >
            <span className="text-sm font-medium text-foreground">
              {m.name}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {m.placeCount} place{m.placeCount !== 1 ? 's' : ''}
            </span>
          </button>
        ))}
      </>
    )}
  </div>
);
