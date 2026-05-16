import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getVenueMapById } from '@/lib/api';
import type {
  PlaceInput,
  DecorationInput,
} from '@/components/dashboard/venue-maps/editor-canvas';
import { VenueMapEditorPage } from './editor-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === 'new') {
    return <VenueMapEditorPage mapId="new" />;
  }

  const cookieStore = await cookies();
  const { data } = await getVenueMapById({
    path: { id },
    headers: { Cookie: cookieStore.toString() },
  });

  if (!data) notFound();

  const places: PlaceInput[] = data.places.map((p) => ({
    id: p.id || crypto.randomUUID(),
    kind: p.kind as 'seat' | 'section',
    label: p.label,
    x: p.x,
    y: p.y,
    width: p.width ?? undefined,
    height: p.height ?? undefined,
    capacity: p.capacity,
  }));

  const decorations: DecorationInput[] = data.decorations.map((d) => ({
    id: d.id || crypto.randomUUID(),
    x: d.x,
    y: d.y,
    width: d.width,
    height: d.height,
    label: d.label,
  }));

  return (
    <VenueMapEditorPage
      mapId={id}
      initialName={data.name}
      initialWidth={data.width}
      initialHeight={data.height}
      initialPlaces={places}
      initialDecorations={decorations}
    />
  );
}
