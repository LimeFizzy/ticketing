import { Check, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const EventPublishingCard = ({
  status,
  saved,
  onSave,
  onPublish,
  onUnpublish,
}: {
  status: 'published' | 'draft';
  saved: boolean;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}) => (
  <Card className="glass border-white/40 shadow-sm">
    <CardHeader>
      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Publishing
      </CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 p-6 pt-0">
      <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2.5">
        {status === 'published' ? (
          <Globe className="size-4 shrink-0 text-primary" />
        ) : (
          <Lock className="size-4 shrink-0 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">
            {status === 'published' ? 'Published' : 'Draft'}
          </p>
          <p className="text-xs text-muted-foreground">
            {status === 'published'
              ? 'Visible to the public'
              : 'Not visible to the public'}
          </p>
        </div>
      </div>

      <Button className="w-full gap-1.5" onClick={onSave}>
        {saved ? <Check className="size-4" /> : null}
        {saved ? 'Saved' : 'Save changes'}
      </Button>

      {status === 'draft' ? (
        <Button
          variant="outline"
          className="w-full gap-1.5"
          onClick={onPublish}
        >
          <Globe className="size-4" />
          Publish event
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-1.5"
          onClick={onUnpublish}
        >
          <Lock className="size-4" />
          Unpublish
        </Button>
      )}
    </CardContent>
  </Card>
);
