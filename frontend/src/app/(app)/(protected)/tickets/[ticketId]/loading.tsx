import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const TicketDetailLoading = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <Skeleton className="h-5 w-32" />
    <Card className="glass border-white/40 shadow-sm">
      <CardContent className="flex flex-col items-center gap-6 p-6">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="size-52 rounded-xl" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-56" />
      </CardContent>
    </Card>
  </div>
);

export default TicketDetailLoading;
