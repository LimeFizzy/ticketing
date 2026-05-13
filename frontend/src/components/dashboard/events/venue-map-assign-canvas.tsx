'use client';

import { useMemo, useRef, useState } from 'react';
import type { VenueMapDto, EventTicketTypeDto } from '@/lib/api/types.gen';
import { TICKET_TYPE_PALETTE } from '@/lib/venue-maps';
import {
  clientToSvg as svgClientToSvg,
  pointInRect,
  rectsOverlap,
} from '@/lib/svg-utils';
import { usePanZoom } from '@/hooks/use-pan-zoom';
import { VenueMapZoomControls } from '@/components/buy/venue-map-zoom-controls';
import { cn } from '@/lib/utils';

const UNASSIGNED_FILL = '#94a3b8';
const UNASSIGNED_STROKE = '#64748b';
const MARQUEE_MIN = 3;

export const CLEAR_ACTION = '__clear__';

interface Marquee {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}

interface VenueMapAssignCanvasProps {
  venueMap: VenueMapDto;
  mappings: Map<string, string>;
  ticketTypes: EventTicketTypeDto[];
  activeAction: string | null;
  onAssign: (placeIds: string[]) => void;
}

export const VenueMapAssignCanvas = ({
  venueMap,
  mappings,
  ticketTypes,
  activeAction,
  onAssign,
}: VenueMapAssignCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const marqueeRef = useRef<Marquee | null>(null);
  // marqueeLive mirrors marqueeRef to trigger re-renders; ref avoids stale closure in pointer handlers
  const [marqueeLive, setMarqueeLive] = useState<Marquee | null>(null);

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return svgClientToSvg(svg, clientX, clientY);
  };

  const handleBgPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const sv = clientToSvg(e.clientX, e.clientY);
    const m: Marquee = { sx: sv.x, sy: sv.y, ex: sv.x, ey: sv.y };
    marqueeRef.current = m;
    setMarqueeLive(m);
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!marqueeRef.current) return;
    const sv = clientToSvg(e.clientX, e.clientY);
    const prev = marqueeRef.current;
    if (Math.abs(sv.x - prev.ex) < 1 && Math.abs(sv.y - prev.ey) < 1) return;
    const next = { ...prev, ex: sv.x, ey: sv.y };
    marqueeRef.current = next;
    setMarqueeLive(next);
  };

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const m = marqueeRef.current;
    if (!m) return;
    marqueeRef.current = null;
    setMarqueeLive(null);

    const rw = Math.abs(m.ex - m.sx);
    const rh = Math.abs(m.ey - m.sy);

    if (rw < MARQUEE_MIN && rh < MARQUEE_MIN) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const placeEl = target?.closest('[data-place-id]') as HTMLElement | null;
      if (placeEl?.dataset.placeId) onAssign([placeEl.dataset.placeId]);
      return;
    }

    const rx = Math.min(m.sx, m.ex);
    const ry = Math.min(m.sy, m.ey);
    const ids: string[] = [];

    for (const place of venueMap.places) {
      if (place.kind === 'seat') {
        if (pointInRect(place.x, place.y, rx, ry, rw, rh)) ids.push(place.id);
      } else {
        const pw = place.width ?? 100;
        const ph = place.height ?? 60;
        if (rectsOverlap(place.x, place.y, pw, ph, rx, ry, rw, rh))
          ids.push(place.id);
      }
    }

    if (ids.length > 0) onAssign(ids);
  };

  const { transform, bindings, zoomIn, zoomOut, reset, canZoomIn, canZoomOut } =
    usePanZoom({ containerRef });

  const typeColors = useMemo(
    () =>
      new Map(
        ticketTypes.map((tt, i) => [
          tt.id,
          TICKET_TYPE_PALETTE[i % TICKET_TYPE_PALETTE.length],
        ])
      ),
    [ticketTypes]
  );

  const transformStyle: React.CSSProperties = {
    transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
    transformOrigin: '0 0',
  };

  const mqRect = marqueeLive
    ? {
        x: Math.min(marqueeLive.sx, marqueeLive.ex),
        y: Math.min(marqueeLive.sy, marqueeLive.ey),
        w: Math.abs(marqueeLive.ex - marqueeLive.sx),
        h: Math.abs(marqueeLive.ey - marqueeLive.sy),
      }
    : null;

  const interactive = activeAction !== null;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full touch-none select-none overflow-hidden rounded-xl bg-muted/30',
        interactive ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      )}
      style={{ height: 320 }}
      {...(interactive ? { onPointerDown: handleBgPointerDown } : bindings)}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${venueMap.width} ${venueMap.height}`}
        className="absolute inset-0 block h-full w-full"
        style={transformStyle}
        onPointerMove={interactive ? handleSvgPointerMove : undefined}
        onPointerUp={interactive ? handleSvgPointerUp : undefined}
        onPointerCancel={interactive ? handleSvgPointerUp : undefined}
      >
        {venueMap.decorations?.map((d) => (
          <g key={d.id}>
            <rect
              x={d.x}
              y={d.y}
              width={d.width}
              height={d.height}
              rx={8}
              className="fill-muted-foreground/15 stroke-muted-foreground/30"
              strokeWidth={1}
            />
            <text
              x={d.x + d.width / 2}
              y={d.y + d.height / 2 + 4}
              textAnchor="middle"
              className="fill-muted-foreground text-[14px] font-semibold uppercase tracking-wider"
            >
              {d.label}
            </text>
          </g>
        ))}

        {venueMap.places.map((place) => {
          const assignedTypeId = mappings.get(place.id);
          const color = assignedTypeId ? typeColors.get(assignedTypeId) : null;
          const fill = color?.fill ?? UNASSIGNED_FILL;
          const stroke = color?.stroke ?? UNASSIGNED_STROKE;
          const ttName = assignedTypeId
            ? ticketTypes.find((t) => t.id === assignedTypeId)?.name
            : null;

          if (place.kind === 'seat') {
            return (
              <g
                key={place.id}
                data-place-id={place.id}
                className={cn(interactive && 'hover:opacity-70')}
              >
                <title>
                  {place.label}
                  {ttName ? ` — ${ttName}` : ' — unassigned'}
                </title>
                <circle
                  cx={place.x}
                  cy={place.y}
                  r={7}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1}
                />
              </g>
            );
          }

          const w = place.width ?? 100;
          const h = place.height ?? 60;
          const cx = place.x + w / 2;
          const cy = place.y + h / 2;
          const labelY = ttName ? cy - 10 : cy - 4;

          return (
            <g
              key={place.id}
              data-place-id={place.id}
              className={cn(interactive && 'hover:opacity-70')}
            >
              <title>
                {place.label}
                {ttName ? ` — ${ttName}` : ' — unassigned'} · cap:{' '}
                {place.capacity}
              </title>
              <rect
                x={place.x}
                y={place.y}
                width={w}
                height={h}
                rx={10}
                fill={fill}
                fillOpacity={color ? 0.3 : 0.12}
                stroke={stroke}
                strokeWidth={1.5}
              />
              <text
                x={cx}
                y={labelY}
                textAnchor="middle"
                className="fill-foreground text-[14px] font-semibold"
              >
                {place.label}
              </text>
              <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {ttName ?? 'unassigned'} · cap: {place.capacity}
              </text>
            </g>
          );
        })}

        {mqRect && mqRect.w > 1 && mqRect.h > 1 && (
          <rect
            x={mqRect.x}
            y={mqRect.y}
            width={mqRect.w}
            height={mqRect.h}
            fill="rgba(37,99,235,0.06)"
            stroke="#2563eb"
            strokeWidth={1}
            strokeDasharray="4 2"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>

      <VenueMapZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={reset}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
        onPointerDown={(e) => e.stopPropagation()}
      />
    </div>
  );
};
