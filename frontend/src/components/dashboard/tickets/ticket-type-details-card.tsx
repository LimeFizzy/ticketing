import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';

type TicketForm = {
  name: string;
  description: string;
  price: string;
  capacity: string;
};

export const TicketTypeDetailsCard = ({
  form,
  patch,
  minCapacity,
  capacityError,
}: {
  form: TicketForm;
  patch: (values: Partial<TicketForm>) => void;
  minCapacity: number;
  capacityError?: string;
}) => (
  <Card className="glass border-white/40 shadow-sm">
    <CardHeader>
      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Details
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 gap-4 p-6 pt-0 sm:grid-cols-2">
      <FormField label="Name" className="sm:col-span-2">
        <Input
          value={form.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="e.g. General Admission"
          required
        />
      </FormField>

      <FormField label="Description (optional)" className="sm:col-span-2">
        <Input
          value={form.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="Short note for buyers"
        />
      </FormField>

      <FormField label="Price (€)">
        <Input
          type="number"
          min={0}
          step={0.01}
          value={form.price}
          onChange={(e) => patch({ price: e.target.value })}
          placeholder="0"
          required
        />
      </FormField>

      <FormField label="Capacity" error={capacityError}>
        <Input
          type="number"
          min={minCapacity}
          value={form.capacity}
          onChange={(e) => patch({ capacity: e.target.value })}
          placeholder="100"
          required
        />
      </FormField>
    </CardContent>
  </Card>
);
