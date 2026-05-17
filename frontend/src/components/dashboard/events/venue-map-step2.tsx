'use client';

import { X } from 'lucide-react';
import type { EventTicketTypeDto, VenueMapDto } from '@/lib/api/types.gen';
import { TICKET_TYPE_PALETTE } from '@/lib/venue-maps';
import {
  VenueMapAssignCanvas,
  CLEAR_ACTION,
} from '@/components/dashboard/events/venue-map-assign-canvas';
import { cn } from '@/lib/utils';

interface VenueMapStep2Props {
  fullMap: VenueMapDto;
  mappings: Map<string, string>;
  ticketTypes: EventTicketTypeDto[];
  activeAction: string | null;
  toggleAction: (id: string) => void;
  onAssign: (placeIds: string[]) => void;
  validationIssues: string[];
}

export const VenueMapStep2 = ({
  fullMap,
  mappings,
  ticketTypes,
  activeAction,
  toggleAction,
  onAssign,
  validationIssues,
}: VenueMapStep2Props) => (
  <div className="flex flex-col gap-3">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ticketTypes.map((tt, i) => {
        const color = TICKET_TYPE_PALETTE[i % TICKET_TYPE_PALETTE.length];
        const isActive = activeAction === tt.id;
        return (
          <button
            key={tt.id}
            type="button"
            onClick={() => toggleAction(tt.id)}
            className={cn(
              'flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors',
              isActive
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-muted/30'
            )}
          >
            <span
              className="mt-0.5 size-3 shrink-0 rounded-full"
              style={{ backgroundColor: color.fill }}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">
                {tt.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                €{tt.price} · {tt.capacity} cap
              </p>
            </div>
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => toggleAction(CLEAR_ACTION)}
        className={cn(
          'flex items-center gap-2 rounded-lg border p-3 text-left transition-colors',
          activeAction === CLEAR_ACTION
            ? 'border-destructive bg-destructive/10'
            : 'border-border hover:bg-muted/30'
        )}
      >
        <X
          className={cn(
            'size-3 shrink-0',
            activeAction === CLEAR_ACTION
              ? 'text-destructive'
              : 'text-muted-foreground'
          )}
        />
        <span
          className={cn(
            'text-xs font-semibold',
            activeAction === CLEAR_ACTION
              ? 'text-destructive'
              : 'text-muted-foreground'
          )}
        >
          Clear
        </span>
      </button>
    </div>

    <VenueMapAssignCanvas
      venueMap={fullMap}
      mappings={mappings}
      ticketTypes={ticketTypes}
      activeAction={activeAction}
      onAssign={onAssign}
    />

    {activeAction === null && (
      <p className="text-center text-xs text-muted-foreground">
        Select a ticket type above to start painting.
      </p>
    )}

    {validationIssues.length > 0 && (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 flex flex-col gap-1">
        {validationIssues.map((issue, i) => (
          <p key={i} className="text-xs text-destructive">
            ⚠ {issue}
          </p>
        ))}
      </div>
    )}
  </div>
);
