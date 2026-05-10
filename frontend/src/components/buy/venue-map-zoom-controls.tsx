'use client';

import { Maximize2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VenueMapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
}

export const VenueMapZoomControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
  canZoomIn,
  canZoomOut,
  onPointerDown,
}: VenueMapZoomControlsProps) => (
  <div
    className="absolute right-3 top-3 flex flex-col gap-1.5"
    onPointerDown={onPointerDown}
  >
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Zoom in"
      onClick={onZoomIn}
      disabled={!canZoomIn}
    >
      <Plus />
    </Button>
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Zoom out"
      onClick={onZoomOut}
      disabled={!canZoomOut}
    >
      <Minus />
    </Button>
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Reset view"
      onClick={onReset}
    >
      <Maximize2 />
    </Button>
  </div>
);
