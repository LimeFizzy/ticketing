'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/ui/form-field';
import { getVenueMapById, createVenueMap, updateVenueMap } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useSaveFeedback } from '@/hooks/use-save-feedback';
import { dashboardVenueMapsRoute } from '@/lib/routes';

interface PlaceInput {
  id?: string;
  kind: 'seat' | 'section';
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  capacity: number;
}

interface DecorationInput {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export default function VenueMapEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const { saved, showSaved } = useSaveFeedback();
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(400);
  const [places, setPlaces] = useState<PlaceInput[]>([]);
  const [decorations, setDecorations] = useState<DecorationInput[]>([]);
  const [saving, setSaving] = useState(false);

  // Row builder state
  const [rowPrefix, setRowPrefix] = useState('A');
  const [rowCount, setRowCount] = useState(10);
  const [rowStartX, setRowStartX] = useState(100);
  const [rowY, setRowY] = useState(100);
  const [rowSpacing, setRowSpacing] = useState(30);

  useEffect(() => {
    params.then(({ id: paramId }) => {
      setId(paramId);
      if (paramId !== 'new') {
        getVenueMapById({ path: { id: paramId } }).then(({ data }) => {
          if (data) {
            setName(data.name);
            setWidth(data.width);
            setHeight(data.height);
            setPlaces(data.places.map((p) => ({
              id: p.id,
              kind: p.kind as 'seat' | 'section',
              label: p.label,
              x: p.x,
              y: p.y,
              width: p.width ?? undefined,
              height: p.height ?? undefined,
              capacity: p.capacity,
            })));
            setDecorations(data.decorations.map((d) => ({
              id: d.id,
              x: d.x, y: d.y, width: d.width, height: d.height, label: d.label,
            })));
          }
        });
      }
    });
  }, [params]);

  const addSeatRow = useCallback(() => {
    const newPlaces: PlaceInput[] = [];
    for (let i = 0; i < rowCount; i++) {
      newPlaces.push({
        kind: 'seat',
        label: `${rowPrefix.toUpperCase()}${i + 1}`,
        x: rowStartX + i * rowSpacing,
        y: rowY,
        capacity: 1,
      });
    }
    setPlaces((prev) => [...prev, ...newPlaces]);
  }, [rowPrefix, rowCount, rowStartX, rowY, rowSpacing]);

  const addSection = useCallback(() => {
    setPlaces((prev) => [
      ...prev,
      { kind: 'section', label: 'New Section', x: 100, y: 100, width: 200, height: 100, capacity: 50 },
    ]);
  }, []);

  const addDecoration = useCallback(() => {
    setDecorations((prev) => [
      ...prev,
      { x: 300, y: 50, width: 200, height: 40, label: 'STAGE' },
    ]);
  }, []);

  const removePlace = useCallback((index: number) => {
    setPlaces((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updatePlace = useCallback((index: number, patch: Partial<PlaceInput>) => {
    setPlaces((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }, []);

  const removeDecoration = useCallback((index: number) => {
    setDecorations((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateDecoration = useCallback((index: number, patch: Partial<DecorationInput>) => {
    setDecorations((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        name,
        width,
        height,
        places: places.map((p) => ({ ...p })),
        decorations: decorations.map((d) => ({ ...d })),
      };

      if (id === 'new') {
        const { data } = await createVenueMap({ body });
        if (data) router.replace(`/dashboard/venue-maps/${data.id}`);
      } else {
        await updateVenueMap({ path: { id: id! }, body });
        showSaved();
      }
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <p className="text-sm text-muted-foreground">Only administrators can manage venue maps.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <Link
        href={dashboardVenueMapsRoute()}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Venue Maps
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          {id === 'new' ? 'Create Venue Map' : 'Edit Venue Map'}
        </h1>
        <Button onClick={handleSave} disabled={saving || !name}>
          {saved ? 'Saved' : saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Map Properties */}
      <Card className="glass border-white/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Map Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 p-6 pt-0 sm:grid-cols-3">
          <FormField label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Zalgiris Arena" />
          </FormField>
          <FormField label="Width">
            <Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          </FormField>
          <FormField label="Height">
            <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </FormField>
        </CardContent>
      </Card>

      {/* Row Builder */}
      <Card className="glass border-white/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Add Seat Row
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 p-6 pt-0 sm:grid-cols-6">
          <FormField label="Prefix">
            <Input value={rowPrefix} onChange={(e) => setRowPrefix(e.target.value)} />
          </FormField>
          <FormField label="Count">
            <Input type="number" value={rowCount} onChange={(e) => setRowCount(Number(e.target.value))} />
          </FormField>
          <FormField label="Start X">
            <Input type="number" value={rowStartX} onChange={(e) => setRowStartX(Number(e.target.value))} />
          </FormField>
          <FormField label="Y">
            <Input type="number" value={rowY} onChange={(e) => setRowY(Number(e.target.value))} />
          </FormField>
          <FormField label="Spacing">
            <Input type="number" value={rowSpacing} onChange={(e) => setRowSpacing(Number(e.target.value))} />
          </FormField>
          <div className="flex items-end">
            <Button onClick={addSeatRow} className="gap-1.5">
              <Plus className="size-4" />
              Add Row
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sections & Decorations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Sections</h2>
            <Button variant="outline" size="sm" onClick={addSection} className="gap-1.5">
              <Plus className="size-3.5" />
              Add Section
            </Button>
          </div>
          {places.filter((p) => p.kind === 'section').map((p, idx) => {
            const realIdx = places.indexOf(p);
            return (
              <Card key={realIdx} className="border-border">
                <CardContent className="grid grid-cols-2 gap-3 p-4">
                  <FormField label="Label">
                    <Input value={p.label} onChange={(e) => updatePlace(realIdx, { label: e.target.value })} />
                  </FormField>
                  <FormField label="Capacity">
                    <Input type="number" value={p.capacity} onChange={(e) => updatePlace(realIdx, { capacity: Number(e.target.value) })} />
                  </FormField>
                  <FormField label="X">
                    <Input type="number" value={p.x} onChange={(e) => updatePlace(realIdx, { x: Number(e.target.value) })} />
                  </FormField>
                  <FormField label="Y">
                    <Input type="number" value={p.y} onChange={(e) => updatePlace(realIdx, { y: Number(e.target.value) })} />
                  </FormField>
                  <FormField label="Width">
                    <Input type="number" value={p.width ?? 200} onChange={(e) => updatePlace(realIdx, { width: Number(e.target.value) })} />
                  </FormField>
                  <FormField label="Height">
                    <Input type="number" value={p.height ?? 100} onChange={(e) => updatePlace(realIdx, { height: Number(e.target.value) })} />
                  </FormField>
                  <div className="col-span-2 flex justify-end">
                    <Button variant="ghost" size="icon-sm" onClick={() => removePlace(realIdx)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Decorations</h2>
            <Button variant="outline" size="sm" onClick={addDecoration} className="gap-1.5">
              <Plus className="size-3.5" />
              Add Decoration
            </Button>
          </div>
          {decorations.map((d, idx) => (
            <Card key={idx} className="border-border">
              <CardContent className="grid grid-cols-2 gap-3 p-4">
                <FormField label="Label">
                  <Input value={d.label} onChange={(e) => updateDecoration(idx, { label: e.target.value })} />
                </FormField>
                <div />
                <FormField label="X">
                  <Input type="number" value={d.x} onChange={(e) => updateDecoration(idx, { x: Number(e.target.value) })} />
                </FormField>
                <FormField label="Y">
                  <Input type="number" value={d.y} onChange={(e) => updateDecoration(idx, { y: Number(e.target.value) })} />
                </FormField>
                <FormField label="Width">
                  <Input type="number" value={d.width} onChange={(e) => updateDecoration(idx, { width: Number(e.target.value) })} />
                </FormField>
                <FormField label="Height">
                  <Input type="number" value={d.height} onChange={(e) => updateDecoration(idx, { height: Number(e.target.value) })} />
                </FormField>
                <div className="col-span-2 flex justify-end">
                  <Button variant="ghost" size="icon-sm" onClick={() => removeDecoration(idx)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Seat List */}
      {places.filter((p) => p.kind === 'seat').length > 0 && (
        <Card className="glass border-white/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Seats ({places.filter((p) => p.kind === 'seat').length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex max-h-60 flex-wrap gap-1.5 overflow-y-auto">
              {places.map((p, idx) =>
                p.kind === 'seat' ? (
                  <Badge key={idx} variant="secondary" className="gap-1 text-xs">
                    {p.label}
                    <button onClick={() => removePlace(idx)} className="ml-0.5 hover:text-destructive">&times;</button>
                  </Badge>
                ) : null,
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
