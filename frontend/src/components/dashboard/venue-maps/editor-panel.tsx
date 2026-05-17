'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/ui/form-field';
import { FormFieldGroup } from '@/components/ui/form-field-group';
import type { PlaceInput, DecorationInput } from './editor-canvas';

interface EditorPanelProps {
  name: string;
  mapWidth: number;
  mapHeight: number;
  places: PlaceInput[];
  decorations: DecorationInput[];
  selectedIds: Set<string>;
  onNameChange: (v: string) => void;
  onWidthChange: (v: number) => void;
  onHeightChange: (v: number) => void;
  onAddRow: (
    prefix: string,
    count: number,
    startX: number,
    y: number,
    spacing: number
  ) => void;
  onAddSection: () => void;
  onAddDecoration: () => void;
  onDeleteSelected: () => void;
  onUpdatePlace: (id: string, patch: Partial<PlaceInput>) => void;
  onUpdateDecoration: (id: string, patch: Partial<DecorationInput>) => void;
}

function nextRowLabel(places: PlaceInput[]): string {
  const prefixes = places
    .filter((p) => p.kind === 'seat')
    .map((p) => p.label.match(/^([A-Z]+)/)?.[1] ?? '')
    .filter(Boolean);
  if (prefixes.length === 0) return 'A';
  const sorted = [...new Set(prefixes)].sort();
  const last = sorted[sorted.length - 1];
  const chars = last.split('');
  let i = chars.length - 1;
  while (i >= 0) {
    if (chars[i] < 'Z') {
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
      break;
    }
    chars[i] = 'A';
    i--;
  }
  if (i < 0) chars.unshift('A');
  return chars.join('');
}

function nextRowY(places: PlaceInput[]): number {
  const seats = places.filter((p) => p.kind === 'seat');
  if (seats.length === 0) return 80;
  return Math.max(...seats.map((p) => p.y)) + 40;
}

export function EditorPanel({
  name,
  mapWidth,
  mapHeight,
  places,
  decorations,
  selectedIds,
  onNameChange,
  onWidthChange,
  onHeightChange,
  onAddRow,
  onAddSection,
  onAddDecoration,
  onDeleteSelected,
  onUpdatePlace,
  onUpdateDecoration,
}: EditorPanelProps) {
  const [rowOpen, setRowOpen] = useState(false);
  const [rowPrefix, setRowPrefix] = useState(() => nextRowLabel(places));
  const [rowCount, setRowCount] = useState(10);
  const [rowStartX, setRowStartX] = useState(60);
  const [rowY, setRowY] = useState(() => nextRowY(places));
  const [rowSpacing, setRowSpacing] = useState(30);

  const prevLengthRef = useRef(places.length);
  useEffect(() => {
    if (places.length > 0 && prevLengthRef.current === 0) {
      setRowPrefix(nextRowLabel(places));
      setRowY(nextRowY(places));
    }
    prevLengthRef.current = places.length;
  }, [places]);

  // Derive single-selection details
  const selectedCount = selectedIds.size;
  const singleId =
    selectedCount === 1 ? selectedIds.values().next().value! : null;
  const selectedPlace = singleId
    ? (places.find((p) => p.id === singleId) ?? null)
    : null;
  const selectedDecoration = singleId
    ? (decorations.find((d) => d.id === singleId) ?? null)
    : null;

  const seatCount = places.filter((p) => p.kind === 'seat').length;
  const sectionCount = places.filter((p) => p.kind === 'section').length;

  function handleAddRow() {
    onAddRow(rowPrefix, rowCount, rowStartX, rowY, rowSpacing);
    setRowPrefix(
      nextRowLabel([
        ...places,
        {
          id: '',
          kind: 'seat',
          label: `${rowPrefix}1`,
          x: 0,
          y: 0,
          capacity: 1,
        },
      ])
    );
    setRowY((prev) => prev + 40);
  }

  const deleteLabel =
    selectedCount > 1 ? `Delete ${selectedCount} elements` : 'Delete';

  return (
    <div className="flex w-72 shrink-0 flex-col gap-4">
      {/* Map Properties */}
      <Card className="glass border-white/40 shadow-sm">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Map Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-3">
          <FormField label="Name">
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Žalgiris Arena"
            />
          </FormField>
          <FormFieldGroup>
            <FormField label="Width (px)">
              <Input
                type="number"
                value={mapWidth}
                min={200}
                max={4000}
                onChange={(e) => onWidthChange(Number(e.target.value))}
              />
            </FormField>
            <FormField label="Height (px)">
              <Input
                type="number"
                value={mapHeight}
                min={200}
                max={4000}
                onChange={(e) => onHeightChange(Number(e.target.value))}
              />
            </FormField>
          </FormFieldGroup>
        </CardContent>
      </Card>

      {/* Add Elements */}
      <Card className="glass border-white/40 shadow-sm">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Add Elements
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 px-4 pb-4 pt-3">
          <button
            type="button"
            onClick={() => setRowOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            <span className="flex items-center gap-1.5">
              <Plus className="size-3.5" />
              Add Seat Row
            </span>
            {rowOpen ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>

          {rowOpen && (
            <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/20 px-3 py-3">
              <FormFieldGroup>
                <FormField label="Row Label">
                  <Input
                    value={rowPrefix}
                    maxLength={3}
                    onChange={(e) => setRowPrefix(e.target.value.toUpperCase())}
                  />
                </FormField>
                <FormField label="Seat Count">
                  <Input
                    type="number"
                    value={rowCount}
                    min={1}
                    max={200}
                    onChange={(e) => setRowCount(Number(e.target.value))}
                  />
                </FormField>
              </FormFieldGroup>
              <FormFieldGroup>
                <FormField label="Start X">
                  <Input
                    type="number"
                    value={rowStartX}
                    onChange={(e) => setRowStartX(Number(e.target.value))}
                  />
                </FormField>
                <FormField label="Y Position">
                  <Input
                    type="number"
                    value={rowY}
                    onChange={(e) => setRowY(Number(e.target.value))}
                  />
                </FormField>
              </FormFieldGroup>
              <FormField label="Spacing (px)">
                <Input
                  type="number"
                  value={rowSpacing}
                  min={10}
                  max={100}
                  onChange={(e) => setRowSpacing(Number(e.target.value))}
                />
              </FormField>
              <Button
                size="sm"
                onClick={handleAddRow}
                disabled={!rowPrefix || rowCount < 1}
              >
                Add Row
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 justify-start"
            onClick={onAddSection}
          >
            <Plus className="size-3.5" />
            Add Section
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 justify-start"
            onClick={onAddDecoration}
          >
            <Plus className="size-3.5" />
            Add Decoration
          </Button>
        </CardContent>
      </Card>

      {/* Multi-selection summary */}
      {selectedCount > 1 && (
        <Card className="border-primary/30 shadow-sm">
          <CardContent className="flex flex-col gap-3 px-4 py-4">
            <p className="text-sm font-medium text-foreground">
              {selectedCount} elements selected
            </p>
            <p className="text-xs text-muted-foreground">
              Drag any selected element to move them all together.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              onClick={onDeleteSelected}
            >
              <Trash2 className="size-3.5" />
              {deleteLabel}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Single selection — seat */}
      {selectedPlace && (
        <Card className="border-primary/30 shadow-sm">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {selectedPlace.kind === 'seat' ? 'Seat' : 'Section'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-3">
            <FormField label="Label">
              <Input
                value={selectedPlace.label}
                onChange={(e) =>
                  onUpdatePlace(selectedPlace.id, { label: e.target.value })
                }
              />
            </FormField>
            {selectedPlace.kind === 'section' && (
              <>
                <FormField label="Capacity">
                  <Input
                    type="number"
                    value={selectedPlace.capacity}
                    min={1}
                    onChange={(e) =>
                      onUpdatePlace(selectedPlace.id, {
                        capacity: Number(e.target.value),
                      })
                    }
                  />
                </FormField>
                <FormFieldGroup>
                  <FormField label="Width (px)">
                    <Input
                      type="number"
                      value={selectedPlace.width ?? 200}
                      min={30}
                      onChange={(e) =>
                        onUpdatePlace(selectedPlace.id, {
                          width: Number(e.target.value),
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Height (px)">
                    <Input
                      type="number"
                      value={selectedPlace.height ?? 100}
                      min={30}
                      onChange={(e) =>
                        onUpdatePlace(selectedPlace.id, {
                          height: Number(e.target.value),
                        })
                      }
                    />
                  </FormField>
                </FormFieldGroup>
              </>
            )}
            {selectedPlace.kind === 'seat' && (
              <p className="text-xs text-muted-foreground">
                Drag on the canvas to reposition.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              onClick={onDeleteSelected}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Single selection — decoration */}
      {selectedDecoration && (
        <Card className="border-primary/30 shadow-sm">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Decoration
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-3">
            <FormField label="Label">
              <Input
                value={selectedDecoration.label}
                onChange={(e) =>
                  onUpdateDecoration(selectedDecoration.id, {
                    label: e.target.value,
                  })
                }
              />
            </FormField>
            <FormFieldGroup>
              <FormField label="Width (px)">
                <Input
                  type="number"
                  value={selectedDecoration.width}
                  min={30}
                  onChange={(e) =>
                    onUpdateDecoration(selectedDecoration.id, {
                      width: Number(e.target.value),
                    })
                  }
                />
              </FormField>
              <FormField label="Height (px)">
                <Input
                  type="number"
                  value={selectedDecoration.height}
                  min={20}
                  onChange={(e) =>
                    onUpdateDecoration(selectedDecoration.id, {
                      height: Number(e.target.value),
                    })
                  }
                />
              </FormField>
            </FormFieldGroup>
            <p className="text-xs text-muted-foreground">
              Drag to reposition · corner handles to resize.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              onClick={onDeleteSelected}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="flex flex-wrap gap-1.5 px-1">
        <Badge variant="secondary">
          {seatCount} seat{seatCount !== 1 ? 's' : ''}
        </Badge>
        <Badge variant="secondary">
          {sectionCount} section{sectionCount !== 1 ? 's' : ''}
        </Badge>
        <Badge variant="secondary">
          {decorations.length} decoration{decorations.length !== 1 ? 's' : ''}
        </Badge>
      </div>
    </div>
  );
}
