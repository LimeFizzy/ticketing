import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const VenueMapsLoading = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
    <div className="flex items-center justify-between gap-4">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-8 w-32" />
    </div>
    <Card className="glass border-white/40 shadow-sm">
      <CardContent className="flex flex-col gap-3 p-5">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  </div>
);

export default VenueMapsLoading;
