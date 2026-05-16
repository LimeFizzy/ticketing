import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES, type EventCategory } from '@/types/event';

type EventFormValues = {
  title: string;
  category: EventCategory;
  date: string;
  venue: string;
  city: string;
  description: string;
};

interface EventFormFieldsProps {
  form: EventFormValues;
  patch: (values: Partial<EventFormValues>) => void;
  errors?: Partial<Record<keyof EventFormValues, string>>;
}

export const EventFormFields = ({ form, patch, errors }: EventFormFieldsProps) => (
  <>
    <Card className="glass border-white/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 p-6 pt-0 sm:grid-cols-2">
        <FormField label="Title" className="sm:col-span-2" error={errors?.title}>
          <Input
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Event name"
            required
          />
        </FormField>

        <FormField label="Category" className="sm:col-span-2">
          <Select
            value={form.category}
            onValueChange={(v) => patch({ category: v as EventCategory })}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue>{() => form.category}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Description" className="sm:col-span-2">
          <Textarea
            value={form.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="Describe what attendees can expect…"
            rows={5}
          />
        </FormField>
      </CardContent>
    </Card>

    <Card className="glass border-white/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Date & Location
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 p-6 pt-0 sm:grid-cols-2">
        <FormField label="Date & Time" className="sm:col-span-2" error={errors?.date}>
          <DateTimePicker
            value={form.date}
            onChange={(date) => patch({ date })}
          />
        </FormField>

        <FormField label="Location" error={errors?.venue}>
          <Input
            value={form.venue}
            onChange={(e) => patch({ venue: e.target.value })}
            placeholder="Location name"
            required
          />
        </FormField>

        <FormField label="City" error={errors?.city}>
          <Input
            value={form.city}
            onChange={(e) => patch({ city: e.target.value })}
            placeholder="City"
            required
          />
        </FormField>
      </CardContent>
    </Card>
  </>
);
