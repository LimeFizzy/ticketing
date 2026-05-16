import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsLoading = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
    <Skeleton className="h-9 w-36" />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="glass border-white/40 shadow-sm">
          <CardContent className="flex flex-col gap-2 p-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="flex flex-col gap-3">
      <Skeleton className="h-6 w-20" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="glass border-white/40 shadow-sm">
          <CardContent className="p-4">
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default AnalyticsLoading;
