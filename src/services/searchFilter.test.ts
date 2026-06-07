import { describe, it, expect } from "vitest";
import type { Dorm } from "../types";
import { DEFAULT_FILTER } from "../types";
import {
  searchDorms,
  filterDorms,
  searchAndFilter,
  sortDorms,
  suggestBuildings,
} from "./searchFilter";

const sampleDorms: Dorm[] = [
  {
    building: "Olney",
    npeople: 1,
    floor: 2,
    rnum: 201,
    sqft: 190,
    address: "29 Brown St",
    nwindows: 2,
    campusside: "South",
    suite: false,
    sharedbathrooms: true,
    id: 1,
    imgurl: "https://example.com/olney.jpg",
  },
  {
    building: "Miller",
    npeople: 2,
    floor: 3,
    rnum: 305,
    sqft: 220,
    address: "118 Cushing St",
    nwindows: 1,
    campusside: "North",
    suite: false,
    sharedbathrooms: false,
    id: 2,
    imgurl: "https://example.com/miller.jpg",
  },
  {
    building: "Marcy House",
    npeople: 1,
    floor: 1,
    rnum: 102,
    sqft: 250,
    address: "29 Brown St",
    nwindows: 2,
    campusside: "South",
    suite: true,
    sharedbathrooms: false,
    id: 3,
    imgurl: "https://example.com/marcy.jpg",
  },
];

describe("searchDorms", () => {
  it("returns all dorms for empty query", () => {
    expect(searchDorms(sampleDorms, "")).toHaveLength(3);
    expect(searchDorms(sampleDorms, "   ")).toHaveLength(3);
  });

  it("matches building name tags", () => {
    const results = searchDorms(sampleDorms, "Olney");
    expect(results).toHaveLength(1);
    expect(results[0].building).toBe("Olney");
  });

  it("matches room type tags", () => {
    const results = searchDorms(sampleDorms, "single");
    expect(results.some((d) => d.npeople === 1)).toBe(true);
  });
});

describe("filterDorms", () => {
  it("filters by campus side", () => {
    const results = filterDorms(sampleDorms, { ...DEFAULT_FILTER, campusSide: "north" });
    expect(results).toHaveLength(1);
    expect(results[0].building).toBe("Miller");
  });

  it("filters private bathroom only", () => {
    const results = filterDorms(sampleDorms, { ...DEFAULT_FILTER, noSharedBathrooms: true });
    expect(results.every((d) => !d.sharedbathrooms)).toBe(true);
  });

  it("filters by min sqft", () => {
    const results = filterDorms(sampleDorms, { ...DEFAULT_FILTER, minSqft: 200 });
    expect(results.every((d) => d.sqft >= 200)).toBe(true);
  });
});

describe("searchAndFilter", () => {
  it("combines search and filter", () => {
    const results = searchAndFilter(sampleDorms, "south", {
      ...DEFAULT_FILTER,
      roomType: "single",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((d) => d.campusside === "South" && d.npeople === 1)).toBe(true);
  });
});

describe("sortDorms", () => {
  it("sorts by sqft descending", () => {
    const sorted = sortDorms(sampleDorms, "sqft-desc", new Map());
    expect(sorted[0].sqft).toBeGreaterThanOrEqual(sorted[1].sqft);
  });

  it("sorts by building name", () => {
    const sorted = sortDorms(sampleDorms, "building-asc", new Map());
    expect(sorted[0].building.localeCompare(sorted[1].building)).toBeLessThanOrEqual(0);
  });
});

describe("suggestBuildings", () => {
  it("returns matching building names", () => {
    const suggestions = suggestBuildings(sampleDorms, "mar");
    expect(suggestions).toContain("Marcy House");
  });

  it("returns empty for blank query", () => {
    expect(suggestBuildings(sampleDorms, "")).toEqual([]);
  });
});
