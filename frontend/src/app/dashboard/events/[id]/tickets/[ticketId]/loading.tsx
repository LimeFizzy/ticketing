import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const EditTicketTypeLoading = () => (
  <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
    <Skeleton className="h-5 w-32" />
    <Skeleton className="h-9 w-48" />
    <Card className="glass border-white/40 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
    <Skeleton className="h-9 w-20 self-end" />
  </div>
);

export default EditTicketTypeLoading;
