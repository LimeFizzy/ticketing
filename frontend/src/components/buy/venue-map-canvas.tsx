'use client';

import { type VenueMap, type VenueMapPlace } from '@/types/venue-map';
import { SELECTED_FILL, SOLD_FILL, type PlaceColor } from '@/lib/venue-maps';
import { cn } from '@/lib/utils';
import { EventDto } from '@/lib/api';

interface VenueMapCanvasProps {
  event: EventDto;
  venueMap: VenueMap;
  selection: Record<string, number>;
  capRemaining: number;
  colors: Map<string, PlaceColor>;
  unitPriceFor: (ticketTypeId: string) => number;
  unitNameFor: (ticketTypeId: string) => string;
  transformStyle: React.CSSProperties;
}

export const VenueMapCanvas = ({
  event,
  venueMap,
  selection,
  capRemaining,
  colors,
  unitPriceFor,
  unitNameFor,
  transformStyle,
}: VenueMapCanvasProps) => (
  <svg
    viewBox={`0 0 ${venueMap.width} ${venueMap.height}`}
    className="absolute inset-0 block h-full w-full"
    style={transformStyle}
    role="img"
    aria-label={`${venueMap.name} seating map`}
  >
    {venueMap.decorations?.map((d, i) => (
      <g key={`dec-${i}`}>
        <rect
          x={d.x}
          y={d.y}
          width={d.width}
          height={d.height}
          rx={8}
          className="fill-muted-foreground/15 stroke-muted-foreground/30"
          strokeWidth={1}
        />
        <text
          x={d.x + d.width / 2}
          y={d.y + d.height / 2 + 4}
          textAnchor="middle"
          className="fill-muted-foreground text-[14px] font-semibold uppercase tracking-wider"
        >
          {d.label}
        </text>
      </g>
    ))}

    {venueMap.places.map((place) => {
      const color =
        colors.get(place.ticketTypeId) ?? colors.values().next().value!;
      const qty = selection[place.id] ?? 0;
      const price = unitPriceFor(place.ticketTypeId);
      const name = unitNameFor(place.ticketTypeId);
      const sold = place.available === 0;

      if (place.kind === 'seat') {
        return (
          <SeatPlace
            key={place.id}
            place={place}
            color={color}
            qty={qty}
            price={price}
            name={name}
            sold={sold}
            cannotSelect={sold || (qty === 0 && capRemaining <= 0)}
          />
        );
      }
      return (
        <SectionPlace
          key={place.id}
          place={place}
          color={color}
          qty={qty}
          price={price}
          name={name}
          sold={sold}
          cannotAdd={
            sold || qty >= place.available || (qty === 0 && capRemaining <= 0)
          }
        />
      );
    })}
  </svg>
);

interface SeatPlaceProps {
  place: VenueMapPlace;
  color: PlaceColor;
  qty: number;
  price: number;
  name: string;
  sold: boolean;
  cannotSelect: boolean;
}

const SeatPlace = ({
  place,
  color,
  qty,
  price,
  name,
  sold,
  cannotSelect,
}: SeatPlaceProps) => {
  const selected = qty === 1;
  const fill = sold ? SOLD_FILL : selected ? SELECTED_FILL : color.fill;
  const stroke = sold ? SOLD_FILL : selected ? SELECTED_FILL : color.stroke;

  return (
    <g
      data-place-id={place.id}
      className={cn(
        'transition-opacity',
        cannotSelect ? 'opacity-60' : 'hover:opacity-80'
      )}
    >
      <title>{`${place.label} — ${name} — €${price}${sold ? ' (sold)' : ''}`}</title>
      <circle
        cx={place.x}
        cy={place.y}
        r={selected ? 9 : 7}
        fill={fill}
        stroke={selected ? '#ffffff' : stroke}
        strokeWidth={selected ? 3 : 1}
      />
    </g>
  );
};

interface SectionPlaceProps {
  place: VenueMapPlace;
  color: PlaceColor;
  qty: number;
  price: number;
  name: string;
  sold: boolean;
  cannotAdd: boolean;
}

const SectionPlace = ({
  place,
  color,
  qty,
  price,
  name,
  sold,
  cannotAdd,
}: SectionPlaceProps) => {
  const w = place.width ?? 100;
  const h = place.height ?? 60;
  const cx = place.x + w / 2;
  const cy = place.y + h / 2;
  const remaining = place.available - qty;

  return (
    <g
      data-place-id={place.id}
      className={cn(
        'transition-opacity',
        cannotAdd ? 'opacity-70' : 'hover:opacity-90'
      )}
    >
      <title>{`${place.label} — ${name} — €${price}`}</title>
      <rect
        x={place.x}
        y={place.y}
        width={w}
        height={h}
        rx={10}
        fill={sold ? SOLD_FILL : color.fill}
        fillOpacity={qty > 0 ? 0.35 : 0.18}
        stroke={sold ? SOLD_FILL : color.stroke}
        strokeWidth={qty > 0 ? 3 : 1.5}
      />
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        className="fill-foreground text-[14px] font-semibold"
      >
        {place.label}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px]"
      >
        €{price} · {remaining} left
      </text>
      {qty > 0 ? (
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          className="fill-primary text-[12px] font-semibold"
        >
          {qty} selected — tap to add
        </text>
      ) : (
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px] uppercase tracking-wider"
        >
          {sold ? 'Sold out' : 'Tap to add'}
        </text>
      )}
    </g>
  );
};
