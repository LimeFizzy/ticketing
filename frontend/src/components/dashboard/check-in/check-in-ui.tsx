'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ScanLine,
  Keyboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { checkInTicket } from '@/lib/api';
import type { CheckInResponse, TicketDto } from '@/lib/api/types.gen';
import { formatTicketDate } from '@/lib/formatters';

type ResultState =
  | { type: 'success'; response: CheckInResponse }
  | { type: 'duplicate'; response: CheckInResponse }
  | { type: 'error'; message: string };

interface RecentCheckIn {
  ticket: TicketDto;
  checkedInAt: Date;
}

const QR_READER_ID = 'qr-reader';

interface Props {
  eventId: string;
  eventTitle: string;
  backHref: string;
}

export const CheckInUi = ({ eventId, eventTitle, backHref }: Props) => {
  const router = useRouter();
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<ResultState | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [scannerMode, setScannerMode] = useState<'camera' | 'manual'>('manual');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<unknown>(null);
  const isScanning = useRef(false);

  const performCheckIn = async (ticketCode: string) => {
    setResult(null);

    try {
      const { data, error } = await checkInTicket({
        body: { ticketCode, eventId },
      });

      if (error || !data) {
        const message =
          (error as Record<string, unknown> & { title?: string })?.title ||
          'Check-in failed. Please try again.';
        setResult({ type: 'error', message: String(message) });
        return;
      }

      if (data.wasAlreadyCheckedIn) {
        setResult({ type: 'duplicate', response: data });
      } else {
        setResult({ type: 'success', response: data });
        setRecentCheckIns((prev) => [
          { ticket: data.ticket, checkedInAt: new Date() },
          ...prev,
        ]);
      }
    } catch {
      setResult({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }
  };

  const handleScan = (decodedText: string) => {
    if (isScanning.current) return;
    isScanning.current = true;

    try {
      const payload = JSON.parse(decodedText);
      if (payload.ticketCode) {
        performCheckIn(payload.ticketCode);
      }
    } catch {
      if (decodedText.startsWith('TF-')) {
        performCheckIn(decodedText);
      }
    }

    setTimeout(() => {
      isScanning.current = false;
    }, 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    performCheckIn(code);
    setManualCode('');
  };

  useEffect(() => {
    if (scannerMode !== 'camera') return;

    let cancelled = false;
    let scanner: import('html5-qrcode').Html5Qrcode | null = null;

    const startScanner = async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (cancelled) return;
      scanner = new Html5Qrcode(QR_READER_ID);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10 },
          handleScan,
          () => {}
        );
        setCameraError(null);
      } catch {
        if (!cancelled) {
          setCameraError(
            'Camera access denied or unavailable. Make sure you are using HTTPS and have granted camera permissions.'
          );
          setScannerMode('manual');
        }
        scanner = null;
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (scanner) {
        scanner.stop().catch(() => {});
        scanner = null;
      }
    };
  }, [scannerMode]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(backHref)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl tracking-tight text-foreground">
            Check-in
          </h1>
          <p className="text-sm text-muted-foreground">{eventTitle}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={scannerMode === 'camera' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setScannerMode('camera')}
          className="gap-2"
        >
          <ScanLine className="size-4" />
          Camera
        </Button>
        <Button
          variant={scannerMode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setScannerMode('manual')}
          className="gap-2"
        >
          <Keyboard className="size-4" />
          Manual entry
        </Button>
      </div>

      {cameraError && (
        <Card className="border-amber-500/40 bg-amber-50 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">{cameraError}</p>
          </CardContent>
        </Card>
      )}

      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          {scannerMode === 'camera' ? (
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-black">
              <div
                id={QR_READER_ID}
                className="w-full [&_video]:!block [&_video]:!w-full"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="size-52 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Ticket code
              </label>
              <form onSubmit={handleManualSubmit} className="flex w-full gap-2">
                <Input
                  placeholder="TF-XXXXXXXX"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 font-mono"
                />
                <Button type="submit" disabled={!manualCode.trim()}>
                  Check in
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card
          className={`glass shadow-sm ${
            result.type === 'success'
              ? 'border-green-500/40'
              : result.type === 'duplicate'
                ? 'border-amber-500/40'
                : 'border-red-500/40'
          }`}
        >
          <CardContent className="flex items-start gap-3 p-4">
            {result.type === 'success' && (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
            )}
            {result.type === 'duplicate' && (
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            )}
            {result.type === 'error' && (
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
            )}
            <div className="min-w-0 flex-1">
              {result.type === 'error' ? (
                <p className="text-sm font-medium text-red-700">
                  {result.message}
                </p>
              ) : (
                <>
                  <p
                    className={`text-sm font-semibold ${
                      result.type === 'success'
                        ? 'text-green-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {result.type === 'success'
                      ? 'Checked in successfully'
                      : 'Already checked in'}
                  </p>
                  <div className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
                    <span>
                      {result.response.ticket.eventTitle} &middot;{' '}
                      {result.response.ticket.ticketTypeName}
                    </span>
                    <span className="font-mono text-xs">
                      #{result.response.ticket.ticketCode}
                    </span>
                    {result.type === 'duplicate' &&
                      result.response.ticket.checkedInAt && (
                        <span className="text-xs">
                          Checked in at{' '}
                          {formatTicketDate(result.response.ticket.checkedInAt)}
                        </span>
                      )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {recentCheckIns.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Recent check-ins ({recentCheckIns.length})
          </h2>
          <div className="flex flex-col gap-2">
            {recentCheckIns.map((ci) => (
              <Card
                key={ci.ticket.id}
                className="glass border-white/40 shadow-sm"
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {ci.ticket.ticketTypeName}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      #{ci.ticket.ticketCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTicketDate(ci.checkedInAt.toISOString())}
                    </span>
                    <Badge variant="default" className="bg-green-600">
                      Checked in
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
