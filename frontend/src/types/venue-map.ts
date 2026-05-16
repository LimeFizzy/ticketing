export type PlaceKind = 'seat' | 'section';

export interface VenueMapPlace {
  id: string;
  kind: PlaceKind;
  label: string;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  capacity: number;
  available: number;
  ticketTypeId: string;
}

export interface VenueMapDecoration {
  id: string;
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
  decorations: VenueMapDecoration[];
  places: VenueMapPlace[];
}
