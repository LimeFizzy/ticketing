'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createVenueMap, updateVenueMap } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useSaveFeedback } from '@/hooks/use-save-feedback';
import { dashboardVenueMapsRoute } from '@/lib/routes';
import {
  EditorCanvas,
  type PlaceInput,
  type DecorationInput,
} from '@/components/dashboard/venue-maps/editor-canvas';
import { EditorPanel } from '@/components/dashboard/venue-maps/editor-panel';

interface VenueMapEditorPageProps {
  mapId: string;
  initialName?: string;
  initialWidth?: number;
  initialHeight?: number;
  initialPlaces?: PlaceInput[];
  initialDecorations?: DecorationInput[];
}

export function VenueMapEditorPage({
  mapId: initialMapId,
  initialName = '',
  initialWidth = 900,
  initialHeight = 600,
  initialPlaces = [],
  initialDecorations = [],
}: VenueMapEditorPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { saved, showSaved } = useSaveFeedback();

  const [mapId, setMapId] = useState(initialMapId);
  const [name, setName] = useState(initialName);
  const [mapWidth, setMapWidth] = useState(initialWidth);
  const [mapHeight, setMapHeight] = useState(initialHeight);
  const [places, setPlaces] = useState<PlaceInput[]>(initialPlaces);
  const [decorations, setDecorations] =
    useState<DecorationInput[]>(initialDecorations);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const handleSelectMany = (ids: Set<string>, add: boolean) => {
    setSelectedIds((prev) => (add ? new Set([...prev, ...ids]) : new Set(ids)));
  };

  const handleSelect = (id: string | null, addToSelection: boolean) => {
    if (id === null) {
      setSelectedIds(new Set());
      return;
    }
    if (addToSelection) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setSelectedIds(new Set([id]));
    }
  };

  const handleMovePlace = (id: string, x: number, y: number) => {
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  };

  const handleMoveDecoration = (id: string, x: number, y: number) => {
    setDecorations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, x, y } : d))
    );
  };

  const handleResizeSection = (id: string, width: number, height: number) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, width, height } : p))
    );
  };

  const handleResizeDecoration = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    setDecorations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, x, y, width, height } : d))
    );
  };

  const handleUpdatePlace = (id: string, patch: Partial<PlaceInput>) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const handleUpdateDecoration = (
    id: string,
    patch: Partial<DecorationInput>
  ) => {
    setDecorations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  };

  const handleDeleteSelected = () => {
    setPlaces((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setDecorations((prev) => prev.filter((d) => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
  };

  const handleAddRow = (
    prefix: string,
    count: number,
    startX: number,
    y: number,
    spacing: number
  ) => {
    const newSeats: PlaceInput[] = Array.from({ length: count }, (_, i) => ({
      id: crypto.randomUUID(),
      kind: 'seat',
      label: `${prefix.toUpperCase()}${i + 1}`,
      x: Math.round((startX + i * spacing) / 10) * 10,
      y: Math.round(y / 10) * 10,
      capacity: 1,
    }));
    setPlaces((prev) => [...prev, ...newSeats]);
  };

  const handleAddSection = () => {
    setPlaces((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        kind: 'section',
        label: `Section ${prev.filter((p) => p.kind === 'section').length + 1}`,
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        capacity: 50,
      },
    ]);
  };

  const handleAddDecoration = () => {
    setDecorations((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: 'STAGE',
        x: Math.round(mapWidth / 2) - 100,
        y: 30,
        width: 200,
        height: 40,
      },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        width: mapWidth,
        height: mapHeight,
        places: places.map((p) => ({
          id: p.id,
          kind: p.kind,
          label: p.label,
          x: p.x,
          y: p.y,
          width: p.width ?? null,
          height: p.height ?? null,
          capacity: p.capacity,
        })),
        decorations: decorations.map((d) => ({
          id: d.id,
          x: d.x,
          y: d.y,
          width: d.width,
          height: d.height,
          label: d.label,
        })),
      };

      if (mapId === 'new') {
        const { data } = await createVenueMap({ body });
        if (data) {
          setMapId(data.id);
          router.replace(`/dashboard/venue-maps/${data.id}`);
        }
      } else {
        await updateVenueMap({ path: { id: mapId }, body });
        showSaved();
      }
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <p className="text-sm text-muted-foreground">
          Only administrators can manage venue maps.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <Link
        href={dashboardVenueMapsRoute()}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Venue Maps
      </Link>

      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          {mapId === 'new' ? 'Create Venue Map' : name || 'Edit Venue Map'}
        </h1>
        <Button onClick={handleSave} disabled={saving || !name.trim()}>
          {saved ? 'Saved' : saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <Card className="glass border-white/40 shadow-sm">
            <CardContent className="p-2 sm:p-3">
              <EditorCanvas
                mapWidth={mapWidth}
                mapHeight={mapHeight}
                places={places}
                decorations={decorations}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectMany={handleSelectMany}
                onMovePlace={handleMovePlace}
                onMoveDecoration={handleMoveDecoration}
                onResizeSection={handleResizeSection}
                onResizeDecoration={handleResizeDecoration}
              />
            </CardContent>
          </Card>
        </div>

        <EditorPanel
          name={name}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
          places={places}
          decorations={decorations}
          selectedIds={selectedIds}
          onNameChange={setName}
          onWidthChange={setMapWidth}
          onHeightChange={setMapHeight}
          onAddRow={handleAddRow}
          onAddSection={handleAddSection}
          onAddDecoration={handleAddDecoration}
          onDeleteSelected={handleDeleteSelected}
          onUpdatePlace={handleUpdatePlace}
          onUpdateDecoration={handleUpdateDecoration}
        />
      </div>
    </div>
  );
}
