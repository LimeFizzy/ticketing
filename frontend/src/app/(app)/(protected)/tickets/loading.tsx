import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const TicketsLoading = () => (
  <div className="flex flex-col gap-6 p-6">
    <div className="flex flex-col gap-1">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
    <Skeleton className="h-9 w-48" />
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="glass border-white/40 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <Skeleton className="size-12 shrink-0 rounded-xl" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default TicketsLoading;
