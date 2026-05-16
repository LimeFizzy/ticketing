'use client';

import { useState } from 'react';
import { Check, Loader2, Plus, Pencil, Search, Trash2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createTicketType, deleteTicketType } from '@/lib/api';
import type { OrganizerEventTicketTypeDto } from '@/lib/api/types.gen';

interface TicketTypesListProps {
  eventId: string;
  ticketTypes: OrganizerEventTicketTypeDto[];
  onChange: (ticketTypes: OrganizerEventTicketTypeDto[]) => void;
  onEdit: (id: string) => void;
}

interface Draft {
  name: string;
  description: string;
  price: string;
  capacity: string;
}

const emptyDraft = (): Draft => ({
  name: '',
  description: '',
  price: '',
  capacity: '',
});

const isValid = (d: Draft) =>
  d.name.trim().length > 0 && Number(d.price) >= 0 && Number(d.capacity) >= 1;

export const TicketTypesList = ({
  eventId,
  ticketTypes,
  onChange,
  onEdit,
}: TicketTypesListProps) => {
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const filtered = (() => {
    const q = search.trim().toLowerCase();
    if (!q) return ticketTypes;
    return ticketTypes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  })();

  const patchDraft = (patch: Partial<Draft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const commitAdd = async () => {
    if (!isValid(draft)) return;
    setCommitting(true);
    const { data } = await createTicketType({
      path: { eventId },
      body: {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        price: Number(draft.price),
        capacity: Number(draft.capacity),
      },
    });
    if (data) onChange([...ticketTypes, data]);
    setAdding(false);
    setCommitting(false);
    setDraft(emptyDraft());
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteTicketType({ path: { eventId, ticketTypeId: id } });
    onChange(ticketTypes.filter((t) => t.id !== id));
    setDeletingId(null);
  };

  return (
    <Card className="glass border-white/40 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5"
            disabled={adding}
            onClick={() => {
              setAdding(true);
              setDraft(emptyDraft());
            }}
          >
            <Plus className="size-3.5" />
            Add ticket type
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Description</th>
                <th className="pb-2 pr-4 font-medium">Price</th>
                <th className="pb-2 pr-4 font-medium">Capacity</th>
                <th className="pb-2 pr-4 text-right font-medium">Sold</th>
                <th className="sr-only pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && !adding && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {search
                      ? 'No ticket types match your search.'
                      : 'No ticket types yet.'}
                  </td>
                </tr>
              )}

              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => onEdit(t.id)}
                  className="group cursor-pointer transition-colors hover:bg-muted/40"
                >
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {t.name}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    <span className="line-clamp-1">{t.description ?? '—'}</span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    €{t.price}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {t.capacity}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                    {t.sold} / {t.capacity}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(t.id);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(t.id);
                        }}
                        disabled={deletingId === t.id}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {deletingId === t.id
                          ? <Loader2 className="size-3.5 animate-spin" />
                          : <Trash2 className="size-3.5" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {adding && (
                <tr className="bg-muted/20">
                  <td className="py-2 pr-4">
                    <Input
                      value={draft.name}
                      onChange={(e) => patchDraft({ name: e.target.value })}
                      placeholder="Name"
                      className="h-8"
                      autoFocus
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <Input
                      value={draft.description}
                      onChange={(e) =>
                        patchDraft({ description: e.target.value })
                      }
                      placeholder="Optional"
                      className="h-8"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={draft.price}
                      onChange={(e) => patchDraft({ price: e.target.value })}
                      placeholder="0"
                      className="h-8 w-24"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <Input
                      type="number"
                      min={1}
                      value={draft.capacity}
                      onChange={(e) => patchDraft({ capacity: e.target.value })}
                      placeholder="100"
                      className="h-8 w-24"
                    />
                  </td>
                  <td className="py-2 pr-4 text-right text-muted-foreground">
                    —
                  </td>
                  <td className="py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Confirm"
                        disabled={!isValid(draft) || committing}
                        onClick={commitAdd}
                        className="text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        {committing
                          ? <Loader2 className="size-3.5 animate-spin" />
                          : <Check className="size-3.5" />}
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Cancel"
                        disabled={committing}
                        onClick={() => setAdding(false)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          {filtered.length} of {ticketTypes.length} ticket type
          {ticketTypes.length !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  );
};
