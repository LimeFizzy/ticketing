'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max: number;
  disabled?: boolean;
  className?: string;
}

export const QuantityStepper = ({
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
  className,
}: QuantityStepperProps) => {
  const decDisabled = disabled || value <= min;
  const incDisabled = disabled || value >= max;

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        aria-label="Decrease"
        disabled={decDisabled}
        onClick={() => onChange(value - 1)}
      >
        <Minus />
      </Button>
      <span className="min-w-[1.5rem] text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        aria-label="Increase"
        disabled={incDisabled}
        onClick={() => onChange(value + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
};
