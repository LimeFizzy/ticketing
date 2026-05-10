import { type Event } from '@/types/event';
import {
  SOLD_FILL,
  type PlaceColor,
} from '@/lib/venue-maps';

interface VenueMapLegendProps {
  event: Event;
  colors: Map<string, PlaceColor>;
}

export const VenueMapLegend = ({ event, colors }: VenueMapLegendProps) => (
  <div className="flex flex-wrap gap-3">
    {event.ticketTypes.map((t) => {
      const c = colors.get(t.id);
      if (!c) return null;
      return (
        <div
          key={t.id}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span
            className="inline-block size-3 rounded-full border"
            style={{ backgroundColor: c.fill, borderColor: c.stroke }}
          />
          <span>
            {t.name} — €{t.price}
          </span>
        </div>
      );
    })}
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="inline-block size-3 rounded-full"
        style={{ backgroundColor: SOLD_FILL }}
      />
      <span>Sold</span>
    </div>
  </div>
);
