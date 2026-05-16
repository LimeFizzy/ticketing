'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteTicketType, updateTicketType } from '@/lib/api';
import type { EventDto, OrganizerEventTicketTypeDto } from '@/lib/api/types.gen';
import { dashboardEventTicketsRoute } from '@/lib/routes';
import { useFormState } from '@/hooks/use-form-state';
import { useSaveFeedback } from '@/hooks/use-save-feedback';
import { TicketTypeDetailsCard } from './ticket-type-details-card';
import { TicketTypeActionsCard } from './ticket-type-actions-card';
import { TicketTypeSalesCard } from './ticket-type-sales-card';

type TicketForm = {
  name: string;
  description: string;
  price: string;
  capacity: string;
};

export const EditTicketTypeForm = ({
  event,
  ticketType,
}: {
  event: EventDto;
  ticketType: OrganizerEventTicketTypeDto;
}) => {
  const { id, ticketId } = useParams<{ id: string; ticketId: string }>();
  const router = useRouter();

  const [form, patch] = useFormState<TicketForm>({
    name: ticketType.name,
    description: ticketType.description ?? '',
    price: String(ticketType.price),
    capacity: String(ticketType.capacity),
  });

  const [currentTicketType, setCurrentTicketType] = useState<OrganizerEventTicketTypeDto>(ticketType);
  const { saved, showSaved } = useSaveFeedback();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isValid =
    form.name.trim().length > 0 &&
    Number(form.price) >= 0 &&
    Number(form.capacity) >= 1;

  const capacityError =
    Number(form.capacity) < currentTicketType.sold
      ? `Capacity cannot be less than ${currentTicketType.sold} (already sold)`
      : undefined;

  const handleSave = async () => {
    const newCapacity = Number(form.capacity);
    if (newCapacity < currentTicketType.sold) return;

    setSaving(true);
    const { data } = await updateTicketType({
      path: { eventId: id, ticketTypeId: ticketId },
      body: {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        capacity: newCapacity,
      },
    });

    if (data) {
      setCurrentTicketType(data as OrganizerEventTicketTypeDto);
      showSaved();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`))
      return;
    setDeleting(true);
    await deleteTicketType({ path: { eventId: id, ticketTypeId: ticketId } });
    router.push(dashboardEventTicketsRoute(id));
  };

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
        <div className="flex flex-col gap-6">
          <TicketTypeDetailsCard
            form={form}
            patch={patch}
            minCapacity={currentTicketType.sold}
            capacityError={capacityError}
          />

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
                disabled={deleting}
              >
                {deleting
                  ? <Loader2 className="size-3.5 animate-spin" />
                  : <Trash2 className="size-3.5" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <TicketTypeActionsCard
            saved={saved}
            saving={saving}
            isValid={isValid}
            hasCapacityError={!!capacityError}
            onSave={handleSave}
            onCancel={() => router.push(dashboardEventTicketsRoute(id))}
          />
          <TicketTypeSalesCard ticketType={currentTicketType} />
        </div>
      </div>
    </div>
  );
};
