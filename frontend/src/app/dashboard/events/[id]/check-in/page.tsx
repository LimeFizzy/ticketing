'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { checkInTicket, getEventById } from '@/lib/api';
import type {
  CheckInResponse,
  EventDto,
  TicketDto,
} from '@/lib/api/types.gen';
import { dashboardEventRoute } from '@/lib/routes';
import { useAuth } from '@/hooks/use-auth';
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

const CheckInPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [eventId, setEventId] = useState<string>('');
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<ResultState | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [scannerMode, setScannerMode] = useState<'camera' | 'manual'>('manual');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<unknown>(null);
  const isScanning = useRef(false);

  useEffect(() => {
    params.then(({ id }) => setEventId(id));
  }, [params]);

  useEffect(() => {
    if (!eventId || !user) return;
    getEventById({ path: { id: eventId } })
      .then(({ data }) => {
        if (data) setEvent(data);
      })
      .finally(() => setLoading(false));
  }, [eventId, user]);

  const performCheckIn = useCallback(
    async (ticketCode: string) => {
      if (!eventId) return;
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
    },
    [eventId]
  );

  const handleScan = useCallback(
    (decodedText: string) => {
      if (isScanning.current) return;
      isScanning.current = true;

      try {
        const payload = JSON.parse(decodedText);
        if (payload.ticketId) {
          performCheckIn(payload.ticketId);
        }
      } catch {
        // If it's not JSON, try using the raw text as a ticket code
        if (decodedText.startsWith('TF-')) {
          performCheckIn(decodedText);
        }
      }

      setTimeout(() => {
        isScanning.current = false;
      }, 2000);
    },
    [performCheckIn]
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    performCheckIn(code);
    setManualCode('');
  };

  // Camera scanner setup
  useEffect(() => {
    if (scannerMode !== 'camera' || !eventId) return;

    let scanner: import('html5-qrcode').Html5Qrcode | null = null;

    const startScanner = async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      scanner = new Html5Qrcode(QR_READER_ID);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScan,
          () => {}
        );
        setCameraError(null);
      } catch {
        setCameraError(
          'Camera access denied or unavailable. Make sure you are using HTTPS and have granted camera permissions.'
        );
        setScannerMode('manual');
        scanner = null;
      }
    };

    startScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [scannerMode, eventId, handleScan]);

  if (loading || !event) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(dashboardEventRoute(eventId))}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl tracking-tight text-foreground">
            Check-in
          </h1>
          <p className="text-sm text-muted-foreground">{event.title}</p>
        </div>
      </div>

      {/* Mode toggle */}
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

      {/* Camera error */}
      {cameraError && (
        <Card className="border-amber-500/40 bg-amber-50 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">{cameraError}</p>
          </CardContent>
        </Card>
      )}

      {/* Scanner area */}
      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          {scannerMode === 'camera' ? (
            <div className="w-full max-w-sm">
              <div id={QR_READER_ID} className="w-full" />
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="flex w-full gap-2">
              <Input
                placeholder="Enter ticket code (e.g. TF-XXXXXXXX)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 font-mono"
              />
              <Button type="submit" disabled={!manualCode.trim()}>
                Check in
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Result display */}
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
                          {formatTicketDate(
                            result.response.ticket.checkedInAt
                          )}
                        </span>
                      )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent check-ins */}
      {recentCheckIns.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Recent check-ins ({recentCheckIns.length})
          </h2>
          <div className="flex flex-col gap-2">
            {recentCheckIns.map((ci) => (
              <Card key={ci.ticket.id} className="glass border-white/40 shadow-sm">
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

export default CheckInPage;
