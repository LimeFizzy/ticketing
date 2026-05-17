import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const EventAnalyticsLoading = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
    <Skeleton className="h-5 w-32" />
    <div className="flex flex-col gap-1">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i} className="glass border-white/40 shadow-sm">
          <CardContent className="flex flex-col gap-2 p-4">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="glass border-white/40 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-5">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-40 w-full" />
      </CardContent>
    </Card>
    <Card className="glass border-white/40 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-5">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-52 w-full" />
      </CardContent>
    </Card>
  </div>
);

export default EventAnalyticsLoading;
