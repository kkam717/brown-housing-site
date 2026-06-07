export interface Dorm {
  building: string;
  npeople: number;
  floor: number;
  rnum: number;
  sqft: number;
  address: string;
  nwindows: number;
  campusside: string;
  suite: boolean;
  sharedbathrooms: boolean;
  id: number;
  imgurl: string;
}

export interface FilterState {
  roomType: "all" | "single" | "double" | "triple" | "suite";
  minSqft: number;
  campusSide: "all" | "north" | "south";
  noSharedBathrooms: boolean;
}

export const DEFAULT_FILTER: FilterState = {
  roomType: "all",
  minSqft: 0,
  campusSide: "all",
  noSharedBathrooms: false,
};

export interface ReviewEntry {
  fullname: string;
  email: string;
  review: number;
  comment?: string;
}

export type SortOption =
  | "relevance"
  | "sqft-asc"
  | "sqft-desc"
  | "floor-asc"
  | "floor-desc"
  | "rating-desc"
  | "building-asc";

export interface BuildingMarker {
  name: string;
  lng: number;
  lat: number;
  roomCount: number;
  campusside: string;
  address: string;
}
