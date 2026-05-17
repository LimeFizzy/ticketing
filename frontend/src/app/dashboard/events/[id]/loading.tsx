import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const EditEventLoading = () => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
    <Skeleton className="h-5 w-32" />
    <Skeleton className="h-9 w-48" />
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="glass border-white/40 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5">
            <Skeleton className="h-4 w-28" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Skeleton className="h-9 w-24 self-end" />
  </div>
);

export default EditEventLoading;
