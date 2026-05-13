'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Check, ChevronLeft, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { getOrganizerEvent, updateOrganizerEvent } from '@/lib/mocks/dashboard';
import { dashboardEventTicketsRoute } from '@/lib/routes';
import { useFormState } from '@/hooks/use-form-state';
import { useSaveFeedback } from '@/hooks/use-save-feedback';

type TicketForm = {
  name: string;
  description: string;
  price: string;
  capacity: string;
};

const EditTicketTypePage = () => {
  const { id, ticketId } = useParams<{ id: string; ticketId: string }>();
  const router = useRouter();

  const [event] = useState(() => getOrganizerEvent(id) ?? null);
  const ticketType = event?.ticketTypes.find((t) => t.id === ticketId) ?? null;

  const [form, patch] = useFormState<TicketForm>({
    name: ticketType?.name ?? '',
    description: ticketType?.description ?? '',
    price: ticketType ? String(ticketType.price) : '',
    capacity: ticketType ? String(ticketType.capacity) : '',
  });

  const { saved, showSaved } = useSaveFeedback();

  if (!event || !ticketType) notFound();

  const isValid =
    form.name.trim().length > 0 &&
    Number(form.price) >= 0 &&
    Number(form.capacity) >= 1;

  const handleSave = useCallback(() => {
    updateOrganizerEvent(id, {
      ...event!,
      ticketTypes: event!.ticketTypes.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              name: form.name.trim(),
              description: form.description.trim() || undefined,
              price: Number(form.price),
              capacity: Number(form.capacity),
            }
          : t
      ),
    });
    showSaved();
  }, [id, ticketId, event, form, showSaved]);

  const handleDelete = useCallback(() => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`))
      return;
    updateOrganizerEvent(id, {
      ...event!,
      ticketTypes: event!.ticketTypes.filter((t) => t.id !== ticketId),
    });
    router.push(dashboardEventTicketsRoute(id));
  }, [id, ticketId, event, form.name, router]);

  const soldPct =
    ticketType.capacity > 0
      ? Math.min(100, (ticketType.sold / ticketType.capacity) * 100)
      : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <Link
        href={dashboardEventTicketsRoute(id)}
        className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {event.title} — Ticket Types
      </Link>

      <h1 className="mb-6 min-w-0 truncate font-display text-3xl tracking-tight text-foreground">
        {form.name || 'Untitled ticket type'}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-6">
          <Card className="glass border-white/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 p-6 pt-0 sm:grid-cols-2">
              <FormField label="Name" className="sm:col-span-2">
                <Input
                  value={form.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="e.g. General Admission"
                  required
                />
              </FormField>

              <FormField
                label="Description (optional)"
                className="sm:col-span-2"
              >
                <Input
                  value={form.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder="Short note for buyers"
                />
              </FormField>

              <FormField label="Price (€)">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => patch({ price: e.target.value })}
                  placeholder="0"
                  required
                />
              </FormField>

              <FormField label="Capacity">
                <Input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => patch({ capacity: e.target.value })}
                  placeholder="100"
                  required
                />
              </FormField>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-destructive">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 p-6 pt-0">
              <p className="text-sm text-muted-foreground">
                Permanently delete this ticket type and all associated data.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={handleDelete}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Right sidebar ── */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <Card className="glass border-white/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-6 pt-0">
              <Button
                className="w-full gap-1.5"
                onClick={handleSave}
                disabled={!isValid}
              >
                {saved ? <Check className="size-4" /> : null}
                {saved ? 'Saved' : 'Save changes'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(dashboardEventTicketsRoute(id))}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-white/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-6 pt-0">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{ticketType.sold} sold</span>
                  <span>{ticketType.capacity} total</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${soldPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
                    {ticketType.capacity - ticketType.sold}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
                    €{(ticketType.sold * ticketType.price).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditTicketTypePage;
