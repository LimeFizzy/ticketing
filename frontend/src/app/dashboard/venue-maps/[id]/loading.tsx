import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const VenueMapEditorLoading = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
    <Skeleton className="h-9 w-48" />
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="glass border-white/40 shadow-sm">
        <CardContent className="p-4">
          <Skeleton className="h-[520px] w-full rounded-xl" />
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4">
        <Card className="glass border-white/40 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default VenueMapEditorLoading;
