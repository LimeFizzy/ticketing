import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const BuyTicketsLoading = () => (
  <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
    <Skeleton className="h-5 w-32" />
    <div className="flex flex-col gap-1">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-56" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="glass border-white/40 shadow-sm">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-9 w-28 shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  </div>
);

export default BuyTicketsLoading;
