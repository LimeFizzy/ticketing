'use client';

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delay={300}>
      {children}
    </TooltipPrimitive.Provider>
  );
}
