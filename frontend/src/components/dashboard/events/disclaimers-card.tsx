'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Eye, Lock, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { EventDisclaimers } from '@/components/events/event-disclaimers';
import { STATIC_DISCLAIMERS } from '@/lib/disclaimers';
import { cn } from '@/lib/utils';

interface DisclaimersCardProps {
  value: string;
  onChange: (value: string) => void;
}

export const DisclaimersCard = ({ value, onChange }: DisclaimersCardProps) => {
  const extras = value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Card className="glass border-white/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Disclaimers
        </CardTitle>
        <Dialog.Root>
          <Dialog.Trigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5">
                <Eye className="size-3.5" />
                Preview
              </Button>
            }
          />
          <Dialog.Portal>
            <Dialog.Backdrop
              className={cn(
                'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm',
                'transition-opacity duration-200',
                'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0'
              )}
            />
            <Dialog.Popup
              className={cn(
                'glass fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
                'rounded-2xl border border-white/40 bg-popover p-6 shadow-xl outline-none',
                'transition-all duration-200',
                'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
                'data-[ending-style]:scale-95 data-[ending-style]:opacity-0'
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Title className="text-base font-semibold text-foreground">
                  Disclaimers preview
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
                This is how the disclaimers section appears to buyers on the
                event page.
              </Dialog.Description>
              <EventDisclaimers extras={extras.length ? extras : null} />
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 p-6 pt-0">
        {/* Static defaults */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Lock className="size-3 text-muted-foreground/60" />
            <span className="text-xs font-medium text-muted-foreground">
              Default — always shown to buyers
            </span>
          </div>
          <ul className="flex flex-col gap-1">
            {STATIC_DISCLAIMERS.map((line, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                <span aria-hidden className="select-none">
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Event-specific extras */}
        <FormField
          label="Event-specific disclaimers"
          hint="One disclaimer per line. Added after the defaults above."
        >
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={'Age 18+ only\nNo refunds after purchase'}
            rows={4}
          />
        </FormField>
      </CardContent>
    </Card>
  );
};
