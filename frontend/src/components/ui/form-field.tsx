import { Field } from '@base-ui/react/field';

interface FormFieldProps {
  label: string;
  className?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormField = ({
  label,
  className,
  error,
  hint,
  children,
}: FormFieldProps) => (
  <Field.Root className={className}>
    <Field.Label className="mb-1.5 block text-sm font-medium text-foreground">
      {label}
    </Field.Label>
    {children}
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    {hint && !error && (
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    )}
  </Field.Root>
);
