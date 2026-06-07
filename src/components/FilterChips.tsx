import type { FilterState } from "../types";
import "./FilterChips.css";

interface Props {
  filter: FilterState;
  onRemove: (key: keyof FilterState) => void;
  onClearAll: () => void;
}

export default function FilterChips({ filter, onRemove, onClearAll }: Props) {
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

  if (chips.length === 0) return null;

  return (
    <div className="filter-chips" role="list" aria-label="Active filters">
      {chips.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className="filter-chips__chip"
          role="listitem"
          onClick={() => onRemove(key)}
          aria-label={`Remove filter: ${label}`}
        >
          {label}
          <span aria-hidden="true">&times;</span>
        </button>
      ))}
      <button type="button" className="filter-chips__clear" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}
