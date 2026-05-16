import { Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const TicketTypeActionsCard = ({
  saved,
  saving,
  isValid,
  hasCapacityError,
  onSave,
  onCancel,
}: {
  saved: boolean;
  saving?: boolean;
  isValid: boolean;
  hasCapacityError: boolean;
  onSave: () => void;
  onCancel: () => void;
}) => (
  <Card className="glass border-white/40 shadow-sm">
    <CardHeader>
      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Actions
      </CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 p-6 pt-0">
      <Button
        className="w-full gap-1.5"
        onClick={onSave}
        disabled={!isValid || hasCapacityError || saving}
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : saved ? (
          <Check className="size-4" />
        ) : null}
        {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={onCancel}
        disabled={saving}
      >
        Cancel
      </Button>
    </CardContent>
  </Card>
);
