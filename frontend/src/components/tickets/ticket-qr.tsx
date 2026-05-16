'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface TicketQRProps {
  ticketCode: string;
  eventId: string;
  checkedInAt?: string | null;
  muted?: boolean;
}

export const TicketQR = ({
  ticketCode,
  eventId,
  checkedInAt,
  muted,
}: TicketQRProps) => {
  const isUsed = !!checkedInAt;
  const { user } = useAuth();
  const payload = user ? JSON.stringify({ ticketCode, eventId }) : null;

  if (!payload) return null;

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div
        className={cn(
          'rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5',
          (isUsed || muted) && 'opacity-40 grayscale'
        )}
      >
        <QRCodeSVG value={payload} size={220} level="M" />
      </div>
      {(isUsed || muted) && (
        <Badge variant="secondary" className="absolute -top-2 right-0">
          Used
        </Badge>
      )}
    </div>
  );
};
