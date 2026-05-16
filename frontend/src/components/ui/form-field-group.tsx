import { cn } from '@/lib/utils';

export const FormFieldGroup = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={cn('grid grid-cols-2 gap-3', className)}>{children}</div>;
