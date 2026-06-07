import type { Dorm, BuildingMarker } from "../types";
import { getBuildingCoords } from "../data/buildingLocations";

let cachedDorms: Dorm[] | null = null;
let loadError: string | null = null;

export async function loadDorms(): Promise<Dorm[]> {
  if (cachedDorms) return cachedDorms;
  if (loadError) throw new Error(loadError);

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/mock_data.json`);
    if (!response.ok) {
      throw new Error(`Failed to load dorm data (${response.status})`);
    }
    const data = await response.json();
    cachedDorms = data.dorms as Dorm[];
    return cachedDorms;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load dorm data";
    throw new Error(loadError, { cause: err });
  }
}

export function clearDormCache(): void {
  cachedDorms = null;
  loadError = null;
}

export function getBuildingMarkers(dorms: Dorm[]): BuildingMarker[] {
  const grouped = new Map<string, { dorms: Dorm[]; address: string; campusside: string }>();

  for (const dorm of dorms) {
    const name = dorm.building.trim();
    const existing = grouped.get(name);
    if (existing) {
      existing.dorms.push(dorm);
    } else {
      grouped.set(name, {
        dorms: [dorm],
        address: dorm.address,
        campusside: dorm.campusside,
      });
    }
  }

  const markers: BuildingMarker[] = [];
  for (const [name, info] of grouped) {
    const coords = getBuildingCoords(name);
    if (!coords) continue;
    markers.push({
      name,
      lng: coords.lng,
      lat: coords.lat,
      roomCount: info.dorms.length,
      campusside: info.campusside,
      address: info.address,
    });
  }

  return markers.sort((a, b) => a.name.localeCompare(b.name));
}

export function getUniqueBuildingNames(dorms: Dorm[]): string[] {
  const names = new Set<string>();
  for (const dorm of dorms) {
    names.add(dorm.building.trim());
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}
