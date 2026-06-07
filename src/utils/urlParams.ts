import type { FilterState, SortOption } from "../types";
import { DEFAULT_FILTER } from "../types";

export function filterFromSearchParams(params: URLSearchParams): FilterState {
  const roomType = params.get("type");
  const campusSide = params.get("side");
  const minSqft = Number(params.get("minSqft") ?? "0");
  const bath = params.get("bath");

  const validRoomTypes = ["all", "single", "double", "triple", "suite"] as const;
  const validSides = ["all", "north", "south"] as const;

  return {
    roomType: validRoomTypes.includes(roomType as FilterState["roomType"])
      ? (roomType as FilterState["roomType"])
      : DEFAULT_FILTER.roomType,
    campusSide: validSides.includes(campusSide as FilterState["campusSide"])
      ? (campusSide as FilterState["campusSide"])
      : DEFAULT_FILTER.campusSide,
    minSqft: Number.isFinite(minSqft) && minSqft >= 0 ? minSqft : 0,
    noSharedBathrooms: bath === "private",
  };
}

export function sortFromSearchParams(params: URLSearchParams): SortOption {
  const sort = params.get("sort");
  const valid: SortOption[] = [
    "relevance",
    "sqft-asc",
    "sqft-desc",
    "floor-asc",
    "floor-desc",
    "rating-desc",
    "building-asc",
  ];
  return valid.includes(sort as SortOption) ? (sort as SortOption) : "relevance";
}

export function buildListingsParams(
  query: string,
  filter: FilterState,
  sort: SortOption,
): URLSearchParams {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed) params.set("q", trimmed);
  if (filter.roomType !== "all") params.set("type", filter.roomType);
  if (filter.campusSide !== "all") params.set("side", filter.campusSide);
  if (filter.minSqft > 0) params.set("minSqft", String(filter.minSqft));
  if (filter.noSharedBathrooms) params.set("bath", "private");
  if (sort !== "relevance") params.set("sort", sort);
  return params;
}

export function filterChipLabels(filter: FilterState): { key: keyof FilterState; label: string }[] {
  const chips: { key: keyof FilterState; label: string }[] = [];
  if (filter.roomType !== "all") {
    const labels: Record<string, string> = {
      single: "Single",
      double: "Double",
      triple: "Triple",
      suite: "Suite",
    };
    chips.push({ key: "roomType", label: labels[filter.roomType] ?? filter.roomType });
  }
  if (filter.campusSide !== "all") {
    chips.push({
      key: "campusSide",
      label: filter.campusSide === "north" ? "North Campus" : "South Campus",
    });
  }
  if (filter.minSqft > 0) {
    chips.push({ key: "minSqft", label: `${filter.minSqft}+ sq ft` });
  }
  if (filter.noSharedBathrooms) {
    chips.push({ key: "noSharedBathrooms", label: "Private bathroom" });
  }
  return chips;
}
