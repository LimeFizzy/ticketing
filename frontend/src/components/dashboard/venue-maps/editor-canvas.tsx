'use client';

import { useEffect, useRef, useState } from 'react';
import { Hand, MousePointer2 } from 'lucide-react';
import { usePanZoom } from '@/hooks/use-pan-zoom';
import { VenueMapZoomControls } from '@/components/buy/venue-map-zoom-controls';
import { Button } from '@/components/ui/button';
import {
  clientToSvg as svgClientToSvg,
  pointInRect,
  rectsOverlap,
} from '@/lib/svg-utils';

export interface PlaceInput {
  id: string;
  kind: 'seat' | 'section';
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  capacity: number;
}

export interface DecorationInput {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface EditorCanvasProps {
  mapWidth: number;
  mapHeight: number;
  places: PlaceInput[];
  decorations: DecorationInput[];
  selectedIds: Set<string>;
  onSelect: (id: string | null, addToSelection: boolean) => void;
  onSelectMany: (ids: Set<string>, add: boolean) => void;
  onMovePlace: (id: string, x: number, y: number) => void;
  onMoveDecoration: (id: string, x: number, y: number) => void;
  onResizeSection: (id: string, width: number, height: number) => void;
  onResizeDecoration: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => void;
}

type DragHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se';
type EditorMode = 'select' | 'pan';

interface StartPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'place' | 'decoration';
}

interface DraggingState {
  primaryId: string;
  handle: DragHandle;
  startSvgX: number;
  startSvgY: number;
  startPositions: Record<string, StartPosition>;
  moved: boolean;
}

interface Marquee {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}

const SNAP = 10;
const MIN_SIZE = 30;
const HANDLE_SIZE = 10;
const SEAT_R = 8;
const DRAG_THRESHOLD = 3;
const MARQUEE_MIN = 3;

function snapVal(v: number) {
  return Math.round(v / SNAP) * SNAP;
}

export function EditorCanvas({
  mapWidth,
  mapHeight,
  places,
  decorations,
  selectedIds,
  onSelect,
  onSelectMany,
  onMovePlace,
  onMoveDecoration,
  onResizeSection,
  onResizeDecoration,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef<DraggingState | null>(null);
  const marqueeRef = useRef<Marquee | null>(null);
  const shiftHeldRef = useRef(false);

  const [mode, setMode] = useState<EditorMode>('select');
  const [marqueeLive, setMarqueeLive] = useState<Marquee | null>(null);
  const [, forceUpdate] = useState(0);

  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Track shift key for snap toggle
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftHeldRef.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'Shift') shiftHeldRef.current = false;
    };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', dn);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const handleDeselect = () => {
    if (modeRef.current === 'select') return; // handled by bg pointer up
    onSelect(null, false);
  };

  const { transform, bindings, zoomIn, zoomOut, reset, canZoomIn, canZoomOut } =
    usePanZoom({ containerRef, onTap: handleDeselect });

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return svgClientToSvg(svg, clientX, clientY);
  };

  // ── Element drag ────────────────────────────────────────────────────────────

  function startDrag(
    e: React.PointerEvent,
    id: string,
    type: 'place' | 'decoration',
    handle: DragHandle,
    startX: number,
    startY: number,
    startW: number,
    startH: number
  ) {
    e.stopPropagation();

    if (e.shiftKey && handle === 'move') {
      onSelect(id, true);
      return;
    }

    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    const svgCoords = clientToSvg(e.clientX, e.clientY);
    const isInSelection = selectedIds.has(id);
    if (!isInSelection) onSelect(id, false);

    const dragIds = isInSelection ? [...selectedIds] : [id];
    const startPositions: Record<string, StartPosition> = {};
    for (const sid of dragIds) {
      const p = places.find((x) => x.id === sid);
      if (p) {
        startPositions[sid] = {
          x: p.x,
          y: p.y,
          w: p.width ?? 0,
          h: p.height ?? 0,
          type: 'place',
        };
      } else {
        const d = decorations.find((x) => x.id === sid);
        if (d)
          startPositions[sid] = {
            x: d.x,
            y: d.y,
            w: d.width,
            h: d.height,
            type: 'decoration',
          };
      }
    }
    if (!startPositions[id])
      startPositions[id] = { x: startX, y: startY, w: startW, h: startH, type };

    draggingRef.current = {
      primaryId: id,
      handle,
      startSvgX: svgCoords.x,
      startSvgY: svgCoords.y,
      startPositions,
      moved: false,
    };
    forceUpdate((n) => n + 1);
  }

  // ── Background (marquee start) ───────────────────────────────────────────────

  const handleBgPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); // prevent pan in select mode
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

  // ── SVG pointer move ────────────────────────────────────────────────────────

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    // Marquee update
    if (marqueeRef.current) {
      const sv = clientToSvg(e.clientX, e.clientY);
      const next: Marquee = { ...marqueeRef.current, ex: sv.x, ey: sv.y };
      marqueeRef.current = next;
      setMarqueeLive(next);
      return;
    }

    // Element drag update
    const d = draggingRef.current;
    if (!d) return;

    const svgNow = clientToSvg(e.clientX, e.clientY);
    const rawDx = svgNow.x - d.startSvgX;
    const rawDy = svgNow.y - d.startSvgY;

    if (!d.moved) {
      if (Math.hypot(rawDx, rawDy) < DRAG_THRESHOLD) return;
      draggingRef.current = { ...d, moved: true };
    }

    const useSnap = !shiftHeldRef.current;

    if (d.handle === 'move') {
      for (const [sid, start] of Object.entries(d.startPositions)) {
        const nx = useSnap
          ? snapVal(start.x + rawDx)
          : Math.round(start.x + rawDx);
        const ny = useSnap
          ? snapVal(start.y + rawDy)
          : Math.round(start.y + rawDy);
        if (start.type === 'place') onMovePlace(sid, nx, ny);
        else onMoveDecoration(sid, nx, ny);
      }
      return;
    }

    const primary = d.startPositions[d.primaryId];
    if (!primary) return;
    const { x, y, w, h } = primary;
    let nx = x,
      ny = y,
      nw = w,
      nh = h;
    const sdx = useSnap ? snapVal(rawDx) : rawDx;
    const sdy = useSnap ? snapVal(rawDy) : rawDy;

    if (d.handle === 'se') {
      nw = Math.max(MIN_SIZE, w + sdx);
      nh = Math.max(MIN_SIZE, h + sdy);
    } else if (d.handle === 'sw') {
      const dw = Math.min(w - MIN_SIZE, sdx);
      nx = x + dw;
      nw = w - dw;
      nh = Math.max(MIN_SIZE, h + sdy);
    } else if (d.handle === 'ne') {
      nw = Math.max(MIN_SIZE, w + sdx);
      const dh = Math.min(h - MIN_SIZE, sdy);
      ny = y + dh;
      nh = h - dh;
    } else if (d.handle === 'nw') {
      const dw = Math.min(w - MIN_SIZE, sdx);
      nx = x + dw;
      nw = w - dw;
      const dh = Math.min(h - MIN_SIZE, sdy);
      ny = y + dh;
      nh = h - dh;
    }

    if (primary.type === 'decoration')
      onResizeDecoration(d.primaryId, nx, ny, nw, nh);
    else onResizeSection(d.primaryId, nw, nh);
  };

  // ── SVG pointer up ──────────────────────────────────────────────────────────

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    // Finalize marquee
    const m = marqueeRef.current;
    if (m) {
      marqueeRef.current = null;
      setMarqueeLive(null);

      const rw = Math.abs(m.ex - m.sx);
      const rh = Math.abs(m.ey - m.sy);

      if (rw < MARQUEE_MIN && rh < MARQUEE_MIN) {
        // Treat as background click → deselect
        if (!e.shiftKey) onSelect(null, false);
        return;
      }

      const rx = Math.min(m.sx, m.ex);
      const ry = Math.min(m.sy, m.ey);
      const ids = new Set<string>();

      for (const p of places) {
        if (p.kind === 'seat') {
          if (pointInRect(p.x, p.y, rx, ry, rw, rh)) ids.add(p.id);
        } else {
          const pw = p.width ?? 200,
            ph = p.height ?? 100;
          if (rectsOverlap(p.x, p.y, pw, ph, rx, ry, rw, rh)) ids.add(p.id);
        }
      }
      for (const d of decorations) {
        if (rectsOverlap(d.x, d.y, d.width, d.height, rx, ry, rw, rh))
          ids.add(d.id);
      }

      onSelectMany(ids, e.shiftKey);
      return;
    }

    // Finalize element drag
    const d = draggingRef.current;
    if (d && !d.moved) onSelect(d.primaryId, false);
    draggingRef.current = null;
    forceUpdate((n) => n + 1);
  };

  const transformStyle: React.CSSProperties = {
    transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
    transformOrigin: '0 0',
  };

  const singleSelected =
    selectedIds.size === 1 ? selectedIds.values().next().value! : null;

  function renderHandles(
    x: number,
    y: number,
    w: number,
    h: number,
    id: string,
    type: 'place' | 'decoration'
  ) {
    const corners: {
      handle: DragHandle;
      cx: number;
      cy: number;
      cursor: string;
    }[] = [
      { handle: 'nw', cx: x, cy: y, cursor: 'nw-resize' },
      { handle: 'ne', cx: x + w, cy: y, cursor: 'ne-resize' },
      { handle: 'sw', cx: x, cy: y + h, cursor: 'sw-resize' },
      { handle: 'se', cx: x + w, cy: y + h, cursor: 'se-resize' },
    ];
    return corners.map(({ handle, cx, cy, cursor }) => (
      <rect
        key={handle}
        x={cx - HANDLE_SIZE / 2}
        y={cy - HANDLE_SIZE / 2}
        width={HANDLE_SIZE}
        height={HANDLE_SIZE}
        rx={2}
        fill="white"
        stroke="#2563eb"
        strokeWidth={1.5}
        style={{ cursor }}
        onPointerDown={(e) => startDrag(e, id, type, handle, x, y, w, h)}
      />
    ));
  }

  // Marquee display rect
  const mq = marqueeLive;
  const mqRect = mq
    ? {
        x: Math.min(mq.sx, mq.ex),
        y: Math.min(mq.sy, mq.ey),
        w: Math.abs(mq.ex - mq.sx),
        h: Math.abs(mq.ey - mq.sy),
      }
    : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full touch-none select-none rounded-xl bg-muted/30"
      style={{
        minHeight: 520,
        height: 520,
        cursor: mode === 'pan' ? 'grab' : 'crosshair',
      }}
      {...(mode === 'pan' ? bindings : { onPointerDown: handleBgPointerDown })}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        overflow="visible"
        className="absolute inset-0 block h-full w-full"
        style={transformStyle}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onPointerCancel={handleSvgPointerUp}
      >
        {/* Canvas background + dot grid */}
        <defs>
          <pattern
            id="editor-grid"
            x="0"
            y="0"
            width={SNAP}
            height={SNAP}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={SNAP / 2}
              cy={SNAP / 2}
              r={0.6}
              fill="currentColor"
              className="text-border/60"
            />
          </pattern>
        </defs>
        <rect
          x={0}
          y={0}
          width={mapWidth}
          height={mapHeight}
          className="fill-background"
        />
        <rect
          x={0}
          y={0}
          width={mapWidth}
          height={mapHeight}
          fill="url(#editor-grid)"
        />

        {/* Decorations */}
        {decorations.map((d) => {
          const isSelected = selectedIds.has(d.id);
          return (
            <g key={d.id} style={{ cursor: 'grab' }}>
              <rect
                x={d.x}
                y={d.y}
                width={d.width}
                height={d.height}
                rx={8}
                className={
                  isSelected
                    ? 'fill-muted-foreground/30'
                    : 'fill-muted-foreground/20'
                }
                stroke={isSelected ? '#2563eb' : '#94a3b8'}
                strokeWidth={isSelected ? 2 : 1.5}
                onPointerDown={(e) =>
                  startDrag(
                    e,
                    d.id,
                    'decoration',
                    'move',
                    d.x,
                    d.y,
                    d.width,
                    d.height
                  )
                }
              />
              <text
                x={d.x + d.width / 2}
                y={d.y + d.height / 2 + 5}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                className="fill-muted-foreground uppercase tracking-wider"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {d.label}
              </text>
              {isSelected &&
                singleSelected === d.id &&
                renderHandles(d.x, d.y, d.width, d.height, d.id, 'decoration')}
            </g>
          );
        })}

        {/* Seat places */}
        {places
          .filter((p) => p.kind === 'seat')
          .map((p) => {
            const isSelected = selectedIds.has(p.id);
            return (
              <g
                key={p.id}
                style={{ cursor: 'grab' }}
                onPointerDown={(e) =>
                  startDrag(e, p.id, 'place', 'move', p.x, p.y, 0, 0)
                }
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 10 : SEAT_R}
                  fill={isSelected ? '#2563eb' : '#64748b'}
                  stroke={isSelected ? 'white' : 'none'}
                  strokeWidth={isSelected ? 2 : 0}
                />
                <text
                  x={p.x}
                  y={p.y + SEAT_R + 10}
                  textAnchor="middle"
                  fontSize={8}
                  className="fill-muted-foreground"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {p.label}
                </text>
              </g>
            );
          })}

        {/* Section places */}
        {places
          .filter((p) => p.kind === 'section')
          .map((p) => {
            const w = p.width ?? 200,
              h = p.height ?? 100;
            const isSelected = selectedIds.has(p.id);
            const cx = p.x + w / 2,
              cy = p.y + h / 2;
            return (
              <g key={p.id} style={{ cursor: 'grab' }}>
                <rect
                  x={p.x}
                  y={p.y}
                  width={w}
                  height={h}
                  rx={10}
                  fill={
                    isSelected
                      ? 'rgba(37,99,235,0.22)'
                      : 'rgba(100,116,139,0.12)'
                  }
                  stroke={isSelected ? '#2563eb' : '#64748b'}
                  strokeWidth={2}
                  strokeDasharray={isSelected ? undefined : '6 3'}
                  onPointerDown={(e) =>
                    startDrag(e, p.id, 'place', 'move', p.x, p.y, w, h)
                  }
                />
                <text
                  x={cx}
                  y={cy - 6}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  className="fill-foreground"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {p.label}
                </text>
                <text
                  x={cx}
                  y={cy + 12}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-muted-foreground"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  Cap: {p.capacity}
                </text>
                {isSelected &&
                  singleSelected === p.id &&
                  renderHandles(p.x, p.y, w, h, p.id, 'place')}
              </g>
            );
          })}

        {/* Marquee selection rectangle */}
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

      {/* Mode toggle */}
      <div
        className="absolute left-3 top-3 flex gap-1"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Button
          variant={mode === 'select' ? 'default' : 'outline'}
          size="icon-sm"
          aria-label="Select mode"
          onClick={() => setMode('select')}
        >
          <MousePointer2 />
        </Button>
        <Button
          variant={mode === 'pan' ? 'default' : 'outline'}
          size="icon-sm"
          aria-label="Pan mode"
          onClick={() => setMode('pan')}
        >
          <Hand />
        </Button>
      </div>

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
}
