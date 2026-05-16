import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const EventDetailLoading = () => (
  <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
    <Skeleton className="h-5 w-32" />
    <Skeleton className="h-9 w-72 lg:hidden" />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-4">
        <Card className="glass border-white/40 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <Skeleton className="hidden h-10 w-80 lg:block" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-44" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default EventDetailLoading;
