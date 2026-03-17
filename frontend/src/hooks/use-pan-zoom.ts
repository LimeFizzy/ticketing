'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface PanZoomTransform {
  tx: number;
  ty: number;
  scale: number;
}

export const PAN_ZOOM_INITIAL: PanZoomTransform = { tx: 0, ty: 0, scale: 1 };

const MIN_SCALE = 0.15;
const MAX_SCALE = 4;
const DRAG_THRESHOLD = 6;
const WHEEL_FACTOR = 1.15;
const BUTTON_FACTOR = 1.25;

interface ActivePointer {
  x: number;
  y: number;
}

type DragState =
  | {
      mode: 'pan';
      moved: boolean;
      startX: number;
      startY: number;
      startTx: number;
      startTy: number;
    }
  | {
      mode: 'pinch';
      moved: true;
      startDistance: number;
      startScale: number;
      anchor: { x: number; y: number };
    };

const clampScale = (s: number): number =>
  Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));

const zoomedTransform = (
  prev: PanZoomTransform,
  cx: number,
  cy: number,
  newScale: number
): PanZoomTransform => {
  const factor = newScale / prev.scale;
  return {
    scale: newScale,
    tx: cx - factor * (cx - prev.tx),
    ty: cy - factor * (cy - prev.ty),
  };
};

const sameTransform = (a: PanZoomTransform, b: PanZoomTransform): boolean =>
  a.scale === b.scale && a.tx === b.tx && a.ty === b.ty;

export interface PanZoomBindings {
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
  onPointerMove: React.PointerEventHandler<HTMLDivElement>;
  onPointerUp: React.PointerEventHandler<HTMLDivElement>;
  onPointerCancel: React.PointerEventHandler<HTMLDivElement>;
}

export interface UsePanZoomResult {
  transform: PanZoomTransform;
  bindings: PanZoomBindings;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

interface UsePanZoomOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  onTap?: (clientX: number, clientY: number) => void;
}

export const usePanZoom = ({
  containerRef,
  onTap,
}: UsePanZoomOptions): UsePanZoomResult => {
  const [transform, setTransform] =
    useState<PanZoomTransform>(PAN_ZOOM_INITIAL);
  const transformRef = useRef(PAN_ZOOM_INITIAL);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const pointersRef = useRef<Map<number, ActivePointer>>(new Map());
  const dragRef = useRef<DragState | null>(null);
  const onTapRef = useRef(onTap);
  useEffect(() => {
    onTapRef.current = onTap;
  }, [onTap]);

  const updateTransform = (next: PanZoomTransform) =>
    setTransform((prev) => (sameTransform(prev, next) ? prev : next));

  const zoomAt = (cx: number, cy: number, factor: number) => {
    const prev = transformRef.current;
    const newScale = clampScale(prev.scale * factor);
    if (newScale === prev.scale) return;
    updateTransform(zoomedTransform(prev, cx, cy, newScale));
  };

  const zoomFromCenter = (factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    zoomAt(rect.width / 2, rect.height / 2, factor);
  };

  const reset = () => updateTransform(PAN_ZOOM_INITIAL);

  // Wheel zoom — bound non-passively so preventDefault works.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      zoomAt(cx, cy, e.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pinchAnchor = (rect: DOMRect): { x: number; y: number } | null => {
    const pts = Array.from(pointersRef.current.values());
    if (pts.length < 2) return null;
    return {
      x: (pts[0].x + pts[1].x) / 2 - rect.left,
      y: (pts[0].y + pts[1].y) / 2 - rect.top,
    };
  };

  const pinchDistance = (): number => {
    const pts = Array.from(pointersRef.current.values());
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  const onPointerDown: PanZoomBindings['onPointerDown'] = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      dragRef.current = {
        mode: 'pan',
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
        startTx: transformRef.current.tx,
        startTy: transformRef.current.ty,
      };
      return;
    }
    if (pointersRef.current.size === 2) {
      const anchor = pinchAnchor(e.currentTarget.getBoundingClientRect());
      if (!anchor) return;
      dragRef.current = {
        mode: 'pinch',
        moved: true,
        startDistance: pinchDistance(),
        startScale: transformRef.current.scale,
        anchor,
      };
    }
  };

  const onPointerMove: PanZoomBindings['onPointerMove'] = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const drag = dragRef.current;
    if (!drag) return;

    if (drag.mode === 'pinch') {
      const newDistance = pinchDistance();
      if (newDistance < 1) return;
      const desired = clampScale(
        drag.startScale * (newDistance / drag.startDistance)
      );
      const prev = transformRef.current;
      if (desired === prev.scale) return;
      updateTransform(
        zoomedTransform(prev, drag.anchor.x, drag.anchor.y, desired)
      );
      return;
    }

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) drag.moved = true;
    if (!drag.moved) return;
    updateTransform({
      ...transformRef.current,
      tx: drag.startTx + dx,
      ty: drag.startTy + dy,
    });
  };

  const finishPointer = (
    el: HTMLDivElement,
    pointerId: number,
    clientX: number,
    clientY: number
  ) => {
    pointersRef.current.delete(pointerId);
    try {
      el.releasePointerCapture(pointerId);
    } catch {
      /* ignore */
    }

    if (pointersRef.current.size === 0) {
      const drag = dragRef.current;
      const wasTap = drag && drag.mode === 'pan' && !drag.moved;
      dragRef.current = null;
      if (wasTap) onTapRef.current?.(clientX, clientY);
      return;
    }
    if (pointersRef.current.size === 1) {
      const remaining = Array.from(pointersRef.current.values())[0];
      dragRef.current = {
        mode: 'pan',
        moved: false,
        startX: remaining.x,
        startY: remaining.y,
        startTx: transformRef.current.tx,
        startTy: transformRef.current.ty,
      };
    }
  };

  const onPointerUp: PanZoomBindings['onPointerUp'] = (e) => {
    finishPointer(e.currentTarget, e.pointerId, e.clientX, e.clientY);
  };

  const onPointerCancel: PanZoomBindings['onPointerCancel'] = (e) => {
    finishPointer(e.currentTarget, e.pointerId, e.clientX, e.clientY);
  };

  return {
    transform,
    bindings: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    zoomIn: () => zoomFromCenter(BUTTON_FACTOR),
    zoomOut: () => zoomFromCenter(1 / BUTTON_FACTOR),
    reset,
    canZoomIn: transform.scale < MAX_SCALE,
    canZoomOut: transform.scale > MIN_SCALE,
  };
};
