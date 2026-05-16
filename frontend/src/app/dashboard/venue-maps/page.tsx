import { cookies } from 'next/headers';
import { getVenueMaps } from '@/lib/api';
import { VenueMapsClient } from './venue-maps-client';

export default async function VenueMapsPage() {
  const cookieStore = await cookies();
  const { data, error } = await getVenueMaps({
    headers: { Cookie: cookieStore.toString() },
  });

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <p className="text-sm text-muted-foreground">Only administrators can manage venue maps.</p>
      </div>
    );
  }

  return <VenueMapsClient initialMaps={data ?? []} />;
}
