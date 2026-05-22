'use client';

import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Loader2, Plus, ScanQrCode, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/ui/form-field';
import { getScannersForEvent, inviteScanner, removeScanner } from '@/lib/api';
import type { ScannerDto } from '@/lib/api/types.gen';
import { cn } from '@/lib/utils';

interface Props {
  eventId: string;
  initialScanners: ScannerDto[];
}

interface Draft {
  email: string;
  firstName: string;
  lastName: string;
  assignToAllEvents: boolean;
}

const emptyDraft = (): Draft => ({
  email: '',
  firstName: '',
  lastName: '',
  assignToAllEvents: false,
});

const isValid = (d: Draft) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()) &&
  d.firstName.trim().length > 0;

export const ScannersList = ({ eventId, initialScanners }: Props) => {
  const [scanners, setScanners] = useState<ScannerDto[]>(initialScanners);
  const [open, setOpen] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [apiError, setApiError] = useState<string | null>(null);

  const patchDraft = (patch: Partial<Draft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  const openModal = () => {
    setDraft(emptyDraft());
    setApiError(null);
    setOpen(true);
  };

  const commitAdd = async () => {
    if (!isValid(draft)) return;
    setCommitting(true);
    setApiError(null);

    const { data, error } = await inviteScanner({
      path: { eventId },
      body: {
        email: draft.email.trim(),
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim() || null,
        eventId,
        assignToAllEvents: draft.assignToAllEvents,
      },
    });

    if (error) {
      setApiError(
        (error as Record<string, unknown> & { title?: string })?.title ||
          'Failed to invite scanner.'
      );
      setCommitting(false);
      return;
    }

    if (data) {
      const refreshed = await getScannersForEvent({ path: { eventId } });
      setScanners(refreshed.data ?? [...scanners, data]);
    }
    setCommitting(false);
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await removeScanner({
      path: { eventId, assignmentId: id },
    });
    if (!error) {
      setScanners((prev) => prev.filter((s) => s.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <>
      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Scanners
            </p>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5"
              onClick={openModal}
            >
              <Plus className="size-3.5" />
              Invite scanner
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Scope</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="sr-only pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scanners.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No scanners yet. Invite someone to scan tickets at this
                      event.
                    </td>
                  </tr>
                ) : (
                  scanners.map((scanner) => (
                    <tr key={scanner.id} className="group">
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {scanner.firstName} {scanner.lastName}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {scanner.email}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            scanner.assignToAllEvents ? 'default' : 'secondary'
                          }
                          className={
                            scanner.assignToAllEvents ? 'bg-violet-600' : ''
                          }
                        >
                          {scanner.assignToAllEvents
                            ? 'All events'
                            : 'This event'}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={scanner.isActive ? 'default' : 'secondary'}
                        >
                          {scanner.isActive ? 'Active' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Remove"
                            onClick={() => handleDelete(scanner.id)}
                            disabled={deletingId === scanner.id}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            {deletingId === scanner.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            {scanners.length} scanner{scanners.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop
            className={cn(
              'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm',
              'transition-opacity duration-200',
              'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0'
            )}
          />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Popup
              className={cn(
                'glass w-full max-w-md rounded-2xl border border-white/40 bg-background/95 p-6 shadow-xl outline-none',
                'transition-all duration-200',
                'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
                'data-[ending-style]:scale-95 data-[ending-style]:opacity-0'
              )}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <ScanQrCode className="size-4 text-primary" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-semibold text-foreground">
                    Invite Scanner
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-muted-foreground">
                    They'll receive an email with a link to set up their
                    account.
                  </Dialog.Description>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="First name">
                    <Input
                      value={draft.firstName}
                      onChange={(e) =>
                        patchDraft({ firstName: e.target.value })
                      }
                      placeholder="Jane"
                      maxLength={100}
                      autoFocus
                    />
                  </FormField>
                  <FormField label="Last name">
                    <Input
                      value={draft.lastName}
                      onChange={(e) => patchDraft({ lastName: e.target.value })}
                      placeholder="Smith"
                      maxLength={100}
                    />
                  </FormField>
                </div>

                <FormField label="Email">
                  <Input
                    type="email"
                    value={draft.email}
                    onChange={(e) => patchDraft({ email: e.target.value })}
                    placeholder="jane@example.com"
                    maxLength={256}
                  />
                </FormField>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={draft.assignToAllEvents}
                    onChange={(e) =>
                      patchDraft({ assignToAllEvents: e.target.checked })
                    }
                    className="mt-0.5 size-4 accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Assign to all events
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Scanner will have access to check in tickets for all your
                      events, including future ones.
                    </p>
                  </div>
                </label>

                {apiError && (
                  <p className="text-sm text-destructive">{apiError}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={committing}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={commitAdd}
                  disabled={!isValid(draft) || committing}
                  className="gap-2"
                >
                  {committing && <Loader2 className="size-3.5 animate-spin" />}
                  Send invite
                </Button>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
