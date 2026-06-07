export interface BuildingLocation {
  name: string;
  lng: number;
  lat: number;
}

/** Known lat/lng for Brown dorm buildings on the campus map. */
export const BUILDING_COORDS: Record<string, { lng: number; lat: number }> = {
  "250 Brook Street": { lng: -71.402224, lat: 41.830238 },
  "Barbour Hall": { lng: -71.398119, lat: 41.823888 },
  "Buxton House": { lng: -71.401294, lat: 41.824698 },
  "Casswell Hall": { lng: -71.400404, lat: 41.82364 },
  "Chapin House": { lng: -71.400653, lat: 41.82402 },
  "Danoff Hall": { lng: -71.399003, lat: 41.827241 },
  "Diman House": { lng: -71.401958, lat: 41.82456 },
  "Goddard House": { lng: -71.402473, lat: 41.824952 },
  "Grad Center A": { lng: -71.400977, lat: 41.823114 },
  "Grad Center B": { lng: -71.40103, lat: 41.823607 },
  "Grad Center C": { lng: -71.40103, lat: 41.823607 },
  "Grad Center D": { lng: -71.400653, lat: 41.82402 },
  "V. Gregorian Quad A": { lng: -71.401619, lat: 41.824429 },
  "V. Gregorian Quad B": { lng: -71.401314, lat: 41.824103 },
  "Harkness House": { lng: -71.401314, lat: 41.824103 },
  "Hegeman Hall": { lng: -71.402399, lat: 41.824501 },
  "Hope College": { lng: -71.401714, lat: 41.825279 },
  "King House": { lng: -71.402791, lat: 41.830313 },
  "Littlefield Hall": { lng: -71.39939, lat: 41.823607 },
  "Machado House": { lng: -71.400328, lat: 41.823129 },
  "Marcy House": { lng: -71.403385, lat: 41.824257 },
  "Minden Hall": { lng: -71.403868, lat: 41.824171 },
  Olney: { lng: -71.396189, lat: 41.823562 },
  "Perkins Hall": { lng: -71.400416, lat: 41.824495 },
  "Sears House": { lng: -71.402224, lat: 41.830238 },
  "Slater Hall": { lng: -71.401909, lat: 41.829351 },
  "Sternlicht Commons": { lng: -71.402877, lat: 41.824188 },
  "Wayland House": { lng: -71.402877, lat: 41.824188 },
  "Young Orchard 2": { lng: -71.401566, lat: 41.829606 },
  "Young Orchard 4": { lng: -71.401641, lat: 41.829963 },
  "Young Orchard 10": { lng: -71.401809, lat: 41.830214 },
};

export function getBuildingCoords(buildingName: string): { lng: number; lat: number } | null {
  const trimmed = buildingName.trim();
  if (BUILDING_COORDS[trimmed]) return BUILDING_COORDS[trimmed];
  const match = Object.keys(BUILDING_COORDS).find(
    (key) => key.toLowerCase() === trimmed.toLowerCase(),
  );
  return match ? BUILDING_COORDS[match] : null;
}
