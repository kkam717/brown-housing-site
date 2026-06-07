import type { Dorm, FilterState, SortOption } from "../types";

function generateTags(dorm: Dorm): string[] {
  const tags = dorm.building.toLowerCase().split(" ");
  tags.push(dorm.campusside.toLowerCase());
  tags.push(String(dorm.rnum));
  tags.push(String(dorm.npeople));
  tags.push("people");
  tags.push(String(dorm.npeople - 1));
  tags.push("roommates");

  if (dorm.npeople === 1) tags.push("single");
  else if (dorm.npeople === 2) tags.push("double");
  else if (dorm.npeople === 3) tags.push("triple");

  if (!dorm.sharedbathrooms) {
    tags.push("ensuite", "bathroom");
  }
  if (dorm.suite) tags.push("suite");
  if (dorm.nwindows >= 1) tags.push("window", "windows");

  return tags;
}

export function searchDorms(dorms: Dorm[], query: string): Dorm[] {
  const normalized = query.trim();
  if (normalized.length === 0) return dorms;

  const searchQuery = normalized.replace(/\s+/g, "_").toLowerCase();
  const queryTags = searchQuery.split("_");

  const scored = dorms
    .map((dorm) => {
      const dormTags = generateTags(dorm);
      let score = 0;
      for (const tag of dormTags) {
        if (queryTags.includes(tag)) score++;
      }
      return { dorm, score };
    })
    .filter(({ score }) => score > 0.4 * queryTags.length)
    .sort((a, b) => b.score - a.score);

  return scored.map(({ dorm }) => dorm);
}

export function filterDorms(dorms: Dorm[], filter: FilterState): Dorm[] {
  const npeopleOptions =
    filter.roomType === "single"
      ? [1]
      : filter.roomType === "double"
        ? [2]
        : filter.roomType === "triple"
          ? [3]
          : filter.roomType === "suite"
            ? [1, 2, 3, 4]
            : [1, 2, 3];

  const suiteOptions =
    filter.roomType === "suite" ? [true] : filter.roomType === "all" ? [true, false] : [false];

  const campusOptions =
    filter.campusSide === "north"
      ? ["North"]
      : filter.campusSide === "south"
        ? ["South"]
        : ["North", "South"];

  const sharedBathOptions = filter.noSharedBathrooms ? [false] : [true, false];

  return dorms.filter(
    (dorm) =>
      dorm.sqft >= filter.minSqft &&
      npeopleOptions.includes(dorm.npeople) &&
      campusOptions.includes(dorm.campusside) &&
      suiteOptions.includes(dorm.suite) &&
      sharedBathOptions.includes(dorm.sharedbathrooms),
  );
}

export function searchAndFilter(dorms: Dorm[], query: string, filter: FilterState): Dorm[] {
  return filterDorms(searchDorms(dorms, query), filter);
}

export function sortDorms(
  dorms: Dorm[],
  sort: SortOption,
  ratings: Map<number, number>,
): Dorm[] {
  if (sort === "relevance") return dorms;

  const sorted = [...dorms];
  sorted.sort((a, b) => {
    switch (sort) {
      case "sqft-asc":
        return a.sqft - b.sqft;
      case "sqft-desc":
        return b.sqft - a.sqft;
      case "floor-asc":
        return a.floor - b.floor;
      case "floor-desc":
        return b.floor - a.floor;
      case "rating-desc":
        return (ratings.get(b.id) ?? 0) - (ratings.get(a.id) ?? 0);
      case "building-asc":
        return a.building.localeCompare(b.building);
      default:
        return 0;
    }
  });
  return sorted;
}

export function getUniqueBuildingNames(dorms: Dorm[]): string[] {
  const names = new Set<string>();
  for (const dorm of dorms) {
    names.add(dorm.building.trim());
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function suggestBuildings(dorms: Dorm[], query: string, limit = 8): string[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const buildings = getUniqueBuildingNames(dorms);
  return buildings.filter((name) => name.toLowerCase().includes(normalized)).slice(0, limit);
}
