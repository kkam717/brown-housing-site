import type { FilterState } from "../types";
import { DEFAULT_FILTER } from "../types";

export function removeFilterKey(filter: FilterState, key: keyof FilterState): FilterState {
  switch (key) {
    case "roomType":
      return { ...filter, roomType: DEFAULT_FILTER.roomType };
    case "campusSide":
      return { ...filter, campusSide: DEFAULT_FILTER.campusSide };
    case "minSqft":
      return { ...filter, minSqft: 0 };
    case "noSharedBathrooms":
      return { ...filter, noSharedBathrooms: false };
    default:
      return filter;
  }
}
