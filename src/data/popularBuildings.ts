import { getBuildingImage } from "./buildingImages";

export interface PopularBuilding {
  name: string;
  query: string;
  address: string;
  campusside: string;
}

/** Popular buildings from current housing selection inventory. */
export const POPULAR_BUILDINGS: PopularBuilding[] = [
  {
    name: "Perkins Hall",
    query: "Perkins",
    address: "167 George St (North Campus)",
    campusside: "North",
  },
  {
    name: "Sternlicht Commons",
    query: "Sternlicht",
    address: "353 Brook St (South Campus)",
    campusside: "South",
  },
  {
    name: "Grad Center D",
    query: "Grad Center D",
    address: "40 Charlesfield St (South Campus)",
    campusside: "South",
  },
  {
    name: "Hegeman Hall",
    query: "Hegeman",
    address: "69 Brown St (South Campus)",
    campusside: "South",
  },
  {
    name: "Minden Hall",
    query: "Minden",
    address: "121 Waterman St (South Campus)",
    campusside: "South",
  },
  {
    name: "V. Gregorian Quad A",
    query: "Gregorian",
    address: "95 Brown St (South Campus)",
    campusside: "South",
  },
  {
    name: "Olney",
    query: "Olney",
    address: "29 Brown St (South Campus)",
    campusside: "South",
  },
  {
    name: "Marcy House",
    query: "Marcy",
    address: "29 Brown St (South Campus)",
    campusside: "South",
  },
  {
    name: "Goddard House",
    query: "Goddard",
    address: "29 Brown St (South Campus)",
    campusside: "South",
  },
];

export function getPopularBuildingImage(name: string): string {
  return getBuildingImage(name);
}

export const QUICK_FILTERS = [
  { label: "Singles on North", href: "/listings?q=single&type=single&side=north" },
  { label: "Suites", href: "/listings?q=suite&type=suite" },
  { label: "150+ sq ft", href: "/listings?minSqft=150" },
  { label: "Private bathroom", href: "/listings?bath=private" },
] as const;
