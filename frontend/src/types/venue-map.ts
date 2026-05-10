export type PlaceKind = 'seat' | 'section';

export interface VenueMapPlace {
  id: string;
  kind: PlaceKind;
  label: string;
  ticketTypeId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  capacity: number;
  available: number;
}

export interface VenueMapDecoration {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface VenueMap {
  id: string;
  name: string;
  width: number;
  height: number;
  decorations?: VenueMapDecoration[];
  places: VenueMapPlace[];
}
