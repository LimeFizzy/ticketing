import { Skeleton } from '@/components/ui/skeleton';

const HomeLoading = () => (
  <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-4 py-6 md:px-8 md:py-10">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-14 w-72 md:h-20" />
      <Skeleton className="h-5 w-80" />
    </div>
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-28" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-64 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-5">
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

export default HomeLoading;
