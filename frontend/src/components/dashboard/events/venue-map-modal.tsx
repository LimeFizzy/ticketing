'use client';

import { useEffect, useMemo, useReducer } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getVenueMaps,
  getVenueMapById,
  getEventVenueMapPlaces,
  setEventVenueMapPlaces,
  updateEvent,
} from '@/lib/api';
import type {
  EventDto,
  EventTicketTypeDto,
  EventVenueMapPlaceDto,
  VenueMapDto,
  VenueMapSummaryDto,
} from '@/lib/api/types.gen';
import { CLEAR_ACTION } from '@/components/dashboard/events/venue-map-assign-canvas';
import { VenueMapStep1 } from '@/components/dashboard/events/venue-map-step1';
import { VenueMapStep2 } from '@/components/dashboard/events/venue-map-step2';
import { cn } from '@/lib/utils';

// --- state ---

type ModalState = {
  step: 1 | 2;
  allMaps: VenueMapSummaryDto[];
  selectedMapId: string | null;
  fullMap: VenueMapDto | null;
  mappings: Map<string, string>;
  activeAction: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
};

type ModalAction =
  | { type: 'open'; venueMapId?: string | null }
  | { type: 'maps_loaded'; maps: VenueMapSummaryDto[] }
  | { type: 'loading_done' }
  | { type: 'loading_start' }
  | { type: 'select_map'; id: string | null }
  | { type: 'next'; fullMap: VenueMapDto; mappings: Map<string, string> }
  | { type: 'back' }
  | { type: 'toggle_action'; id: string }
  | { type: 'assign'; placeIds: string[]; actionId: string }
  | { type: 'save_start' }
  | { type: 'save_done' }
  | { type: 'load_error'; message: string }
  | { type: 'save_error'; message: string };

const makeInitialState = (venueMapId?: string | null): ModalState => ({
  step: 1,
  allMaps: [],
  selectedMapId: venueMapId ?? null,
  fullMap: null,
  mappings: new Map(),
  activeAction: null,
  loading: true,
  saving: false,
  error: null,
});

function reduce(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'open':
      return makeInitialState(action.venueMapId);
    case 'maps_loaded':
      return { ...state, allMaps: action.maps };
    case 'loading_done':
      return { ...state, loading: false };
    case 'loading_start':
      return { ...state, loading: true, error: null };
    case 'select_map':
      return { ...state, selectedMapId: action.id };
    case 'next':
      return {
        ...state,
        step: 2,
        fullMap: action.fullMap,
        mappings: action.mappings,
        activeAction: null,
        loading: false,
      };
    case 'back':
      return { ...state, step: 1, activeAction: null };
    case 'toggle_action':
      return {
        ...state,
        activeAction: state.activeAction === action.id ? null : action.id,
      };
    case 'assign': {
      const next = new Map(state.mappings);
      if (action.actionId === CLEAR_ACTION) {
        action.placeIds.forEach((id) => next.delete(id));
      } else {
        action.placeIds.forEach((id) => next.set(id, action.actionId));
      }
      return { ...state, mappings: next };
    }
    case 'save_start':
      return { ...state, saving: true, error: null };
    case 'save_done':
      return { ...state, saving: false };
    case 'load_error':
      return { ...state, loading: false, error: action.message };
    case 'save_error':
      return { ...state, saving: false, error: action.message };
  }
}

// --- component ---

interface VenueMapModalProps {
  event: EventDto;
  ticketTypes: EventTicketTypeDto[];
  onUpdate: (updated: EventDto) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VenueMapModal = ({
  event,
  ticketTypes,
  onUpdate,
  open,
  onOpenChange,
}: VenueMapModalProps) => {
  const [state, dispatch] = useReducer(reduce, undefined, () =>
    makeInitialState(event.venueMapId)
  );
  const {
    step,
    allMaps,
    selectedMapId,
    fullMap,
    mappings,
    activeAction,
    loading,
    saving,
    error,
  } = state;

  useEffect(() => {
    if (!open) return;
    dispatch({ type: 'open', venueMapId: event.venueMapId });
    getVenueMaps()
      .then(({ data }) => {
        if (data)
          dispatch({ type: 'maps_loaded', maps: data as VenueMapSummaryDto[] });
      })
      .finally(() => dispatch({ type: 'loading_done' }));
  }, [open, event.venueMapId]);

  const persist = async (work: () => Promise<EventDto | null>) => {
    dispatch({ type: 'save_start' });
    try {
      const updated = await work();
      if (updated) {
        onUpdate(updated);
        onOpenChange(false);
        dispatch({ type: 'save_done' });
      } else {
        dispatch({
          type: 'save_error',
          message: 'Failed to save. Please try again.',
        });
      }
    } catch {
      dispatch({
        type: 'save_error',
        message: 'Failed to save. Please try again.',
      });
    }
  };

  const buildEventBody = (mapId: string | null) => ({
    title: event.title,
    category: event.category,
    date: event.date,
    venue: event.venue,
    city: event.city,
    imageUrl: event.imageUrl,
    description: event.description,
    featured: event.featured,
    disclaimers: event.disclaimers?.join('|') ?? null,
    status: event.status,
    venueMapId: mapId,
  });

  const handleNext = async () => {
    if (!selectedMapId) return;
    dispatch({ type: 'loading_start' });
    try {
      const [mapRes, mappingsRes] = await Promise.all([
        getVenueMapById({ path: { id: selectedMapId } }),
        getEventVenueMapPlaces({ path: { eventId: event.id } }),
      ]);
      if (!mapRes.data) {
        dispatch({
          type: 'load_error',
          message: 'Failed to load map details. Please try again.',
        });
        return;
      }
      const m = new Map<string, string>();
      if (mappingsRes.data) {
        (mappingsRes.data as EventVenueMapPlaceDto[]).forEach((entry) => {
          if (entry.venueMapPlaceId && entry.eventTicketTypeId)
            m.set(entry.venueMapPlaceId, entry.eventTicketTypeId);
        });
      }
      dispatch({
        type: 'next',
        fullMap: mapRes.data as VenueMapDto,
        mappings: m,
      });
    } catch {
      dispatch({
        type: 'load_error',
        message: 'Failed to load map details. Please try again.',
      });
    }
  };

  const handleSave = () =>
    persist(async () => {
      const { data } = await updateEvent({
        path: { id: event.id },
        body: buildEventBody(selectedMapId),
      });
      return (data as EventDto) ?? null;
    });

  const handleSaveWithMappings = () =>
    persist(async () => {
      const [eventResult] = await Promise.all([
        updateEvent({
          path: { id: event.id },
          body: buildEventBody(selectedMapId),
        }),
        setEventVenueMapPlaces({
          path: { eventId: event.id },
          body: {
            mappings: Array.from(mappings.entries())
              .filter(([, ttId]) => !!ttId)
              .map(([placeId, ttId]) => ({
                venueMapPlaceId: placeId,
                eventTicketTypeId: ttId,
              })),
          },
        }),
      ]);
      return (eventResult.data as EventDto) ?? null;
    });

  const selectedMapSummary = allMaps.find((m) => m.id === selectedMapId);
  const canProceedToStep2 =
    selectedMapId !== null && (selectedMapSummary?.placeCount ?? 0) > 0;

  const validationIssues = useMemo((): string[] => {
    if (!fullMap) return [];
    const mappedCapByType = new Map<string, number>();
    let unassignedCap = 0;
    for (const place of fullMap.places) {
      const ttId = mappings.get(place.id);
      if (ttId) {
        mappedCapByType.set(
          ttId,
          (mappedCapByType.get(ttId) ?? 0) + place.capacity
        );
      } else {
        unassignedCap += place.capacity;
      }
    }
    const issues: string[] = [];
    if (unassignedCap > 0) {
      issues.push(
        `${unassignedCap} seat${unassignedCap !== 1 ? 's' : ''} not assigned to any ticket type`
      );
    }
    for (const tt of ticketTypes) {
      const mapped = mappedCapByType.get(tt.id) ?? 0;
      if (mapped !== tt.capacity) {
        const diff = mapped - tt.capacity;
        issues.push(
          `${tt.name}: ${mapped} mapped vs ${tt.capacity} capacity (${diff > 0 ? '+' : ''}${diff})`
        );
      }
    }
    return issues;
  }, [fullMap, mappings, ticketTypes]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm',
            'transition-opacity duration-200',
            'data-starting-style:opacity-0 data-ending-style:opacity-0'
          )}
        />
        <Dialog.Popup
          className={cn(
            'glass fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-white/40 bg-popover p-6 shadow-xl outline-none',
            'transition-all duration-200',
            'data-starting-style:scale-95 data-starting-style:opacity-0',
            'data-ending-style:scale-95 data-ending-style:opacity-0'
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {step === 1 ? 'Venue Map' : 'Assign Ticket Types'}
            </Dialog.Title>
            <Dialog.Close
              render={
                <Button variant="ghost" size="icon-sm">
                  <X className="size-4" />
                </Button>
              }
            />
          </div>

          <Dialog.Description className="mb-4 text-sm text-muted-foreground">
            {step === 1
              ? 'Select the venue map for this event.'
              : 'Select a ticket type then click places on the map to assign them.'}
          </Dialog.Description>

          {step === 1 && (
            <VenueMapStep1
              loading={loading}
              allMaps={allMaps}
              selectedMapId={selectedMapId}
              onSelect={(id) => dispatch({ type: 'select_map', id })}
            />
          )}

          {step === 2 && fullMap && (
            <VenueMapStep2
              fullMap={fullMap}
              mappings={mappings}
              ticketTypes={ticketTypes}
              activeAction={activeAction}
              toggleAction={(id) => dispatch({ type: 'toggle_action', id })}
              onAssign={(placeIds) => {
                if (activeAction !== null)
                  dispatch({
                    type: 'assign',
                    placeIds,
                    actionId: activeAction,
                  });
              }}
              validationIssues={validationIssues}
            />
          )}

          <div className="mt-5 flex flex-col gap-3">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center justify-between gap-3">
              {step === 2 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: 'back' })}
                  disabled={saving}
                >
                  ← Back
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
              )}

              {step === 2 ? (
                <Button
                  size="sm"
                  onClick={handleSaveWithMappings}
                  disabled={saving || validationIssues.length > 0}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              ) : canProceedToStep2 ? (
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={loading || saving}
                >
                  {loading ? 'Loading…' : 'Next →'}
                </Button>
              ) : (
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
