import type { FilterState } from "../types";
import { DEFAULT_FILTER } from "../types";
import { useState } from "react";
import "./FilterPanel.css";

interface Props {
  filter: FilterState;
  onChange: (filter: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
}

const ROOM_TYPES: { value: FilterState["roomType"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "triple", label: "Triple" },
  { value: "suite", label: "Suite" },
];

export default function FilterPanel({ filter, onChange, onApply, onReset }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filter, ...partial });
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_FILTER });
    onReset();
    setMobileOpen(false);
  };

  const handleApply = () => {
    onApply();
    setMobileOpen(false);
  };

  const panel = (
    <>
      <div className="filter-panel__group">
        <span className="filter-panel__label">Room type</span>
        <div className="filter-panel__buttons" role="group" aria-label="Room type">
          {ROOM_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`filter-panel__btn ${filter.roomType === value ? "active" : ""}`}
              aria-pressed={filter.roomType === value}
              onClick={() => update({ roomType: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-panel__group">
        <span className="filter-panel__label">Campus side</span>
        <div className="filter-panel__buttons" role="group" aria-label="Campus side">
          {(["all", "north", "south"] as const).map((side) => (
            <button
              key={side}
              type="button"
              className={`filter-panel__btn ${filter.campusSide === side ? "active" : ""}`}
              aria-pressed={filter.campusSide === side}
              onClick={() => update({ campusSide: side })}
            >
              {side === "all" ? "All" : side.charAt(0).toUpperCase() + side.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-panel__group filter-panel__group--inline">
        <label className="filter-panel__label" htmlFor="min-sqft">
          Min sq ft
        </label>
        <input
          id="min-sqft"
          type="number"
          min={0}
          className="filter-panel__input"
          value={filter.minSqft || ""}
          placeholder="0"
          onChange={(e) => update({ minSqft: Math.max(0, Number(e.target.value) || 0) })}
        />
      </div>

      <label className="filter-panel__checkbox">
        <input
          type="checkbox"
          checked={filter.noSharedBathrooms}
          onChange={(e) => update({ noSharedBathrooms: e.target.checked })}
        />
        Private bathroom only
      </label>

      <div className="filter-panel__actions">
        <button type="button" className="filter-panel__apply" onClick={handleApply}>
          Apply filters
        </button>
        <button type="button" className="filter-panel__reset" onClick={handleReset}>
          Reset
        </button>
      </div>
    </>
  );

  return (
    <div className="filter-panel-wrapper">
      <button
        type="button"
        className="filter-panel__toggle"
        aria-expanded={mobileOpen}
        aria-controls="filter-panel-content"
        onClick={() => setMobileOpen((o) => !o)}
      >
        Filters
      </button>
      <div
        id="filter-panel-content"
        className={`filter-panel ${mobileOpen ? "filter-panel--open" : ""}`}
      >
        {panel}
      </div>
    </div>
  );
}
