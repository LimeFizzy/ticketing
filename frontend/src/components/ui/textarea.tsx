import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'w-full min-w-0 rounded-lg border border-border bg-white/70 px-2.5 py-2',
        'text-sm resize-none transition-[color,box-shadow]',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        'placeholder:text-muted-foreground',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
