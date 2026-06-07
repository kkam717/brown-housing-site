import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Dorm, FilterState, SortOption } from "../types";
import { DEFAULT_FILTER } from "../types";
import { loadDorms, clearDormCache } from "../services/dormData";
import { searchAndFilter, sortDorms, suggestBuildings } from "../services/searchFilter";
import { getAverageRating, getReviewCount } from "../services/reviews";
import { useReviewSync } from "../context/ReviewSyncContext";
import { addRecentSearch } from "../services/recentSearches";
import { getFavorites } from "../services/favorites";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  buildListingsParams,
  filterFromSearchParams,
  sortFromSearchParams,
} from "../utils/urlParams";
import FilterPanel from "../components/FilterPanel";
import FilterChips from "../components/FilterChips";
import { removeFilterKey } from "../utils/filterUtils";
import DormCard from "../components/DormCard";
import SearchAutocomplete from "../components/SearchAutocomplete";
import EmptyState from "../components/EmptyState";
import CompareModal from "../components/CompareModal";
import { SkeletonList } from "../components/SkeletonCard";
import "./ListingsPage.css";

const PAGE_SIZE = 24;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "sqft-desc", label: "Size (largest)" },
  { value: "sqft-asc", label: "Size (smallest)" },
  { value: "floor-asc", label: "Floor (low to high)" },
  { value: "floor-desc", label: "Floor (high to low)" },
  { value: "rating-desc", label: "Highest rated" },
  { value: "building-asc", label: "Building (A–Z)" },
];

export default function ListingsPage() {
  useDocumentTitle("Room Listings");

  const { cacheVersion, syncSummary } = useReviewSync();
  const [searchParams, setSearchParams] = useSearchParams();
  const panelRef = useRef<HTMLDivElement>(null);

  const initialQuery = searchParams.get("q") ?? "";
  const initialFilter = filterFromSearchParams(searchParams);
  const initialSort = sortFromSearchParams(searchParams);

  const [allDorms, setAllDorms] = useState<Dorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterState>(initialFilter);
  const [appliedFilter, setAppliedFilter] = useState<FilterState>(initialFilter);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [page, setPage] = useState(0);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const fetchDorms = useCallback(() => {
    setLoading(true);
    setError(null);
    loadDorms()
      .then(setAllDorms)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    void fetchDorms();
    void syncSummary();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchDorms, syncSummary]);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const f = filterFromSearchParams(searchParams);
    const s = sortFromSearchParams(searchParams);
    // Sync local state when URL changes (back/forward, shared links)
    /* eslint-disable react-hooks/set-state-in-effect */
    setSearchTerm(q);
    setAppliedQuery(q);
    setFilter(f);
    setAppliedFilter(f);
    setSort(s);
    setPage(0);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [searchParams]);

  useEffect(() => {
    if (debouncedSearch === appliedQuery) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setAppliedQuery(debouncedSearch);
    setPage(0);
    const params = buildListingsParams(debouncedSearch, appliedFilter, sort);
    setSearchParams(params, { replace: true });
    /* eslint-enable react-hooks/set-state-in-effect */
    if (debouncedSearch.trim()) addRecentSearch(debouncedSearch);
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const syncUrl = useCallback(
    (query: string, f: FilterState, s: SortOption) => {
      setSearchParams(buildListingsParams(query, f, s));
    },
    [setSearchParams],
  );

  const filtered = useMemo(
    () => searchAndFilter(allDorms, appliedQuery, appliedFilter),
    [allDorms, appliedQuery, appliedFilter],
  );

  const ratings = useMemo(() => {
    const map = new Map<number, number>();
    for (const dorm of filtered) {
      map.set(dorm.id, getAverageRating(dorm.id));
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, cacheVersion]);

  const reviewCounts = useMemo(() => {
    const map = new Map<number, number>();
    for (const dorm of filtered) {
      map.set(dorm.id, getReviewCount(dorm.id));
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, cacheVersion]);

  const sorted = useMemo(
    () => sortDorms(filtered, sort, ratings),
    [filtered, sort, ratings],
  );

  const displayResults = useMemo(() => {
    if (!showFavoritesOnly) return sorted;
    const favs = new Set(getFavorites());
    return sorted.filter((d) => favs.has(d.id));
  }, [sorted, showFavoritesOnly]);

  const suggestions = useMemo(
    () => suggestBuildings(allDorms, searchTerm),
    [allDorms, searchTerm],
  );

  const totalPages = Math.max(1, Math.ceil(displayResults.length / PAGE_SIZE));
  const pageResults = displayResults.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const compareDorms = useMemo(
    () => allDorms.filter((d) => compareIds.includes(d.id)),
    [allDorms, compareIds],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(searchTerm);
    setPage(0);
    syncUrl(searchTerm, appliedFilter, sort);
    if (searchTerm.trim()) addRecentSearch(searchTerm);
  };

  const handleApplyFilter = () => {
    setAppliedFilter({ ...filter });
    setPage(0);
    syncUrl(appliedQuery, filter, sort);
  };

  const handleResetFilter = () => {
    setFilter({ ...DEFAULT_FILTER });
    setAppliedFilter({ ...DEFAULT_FILTER });
    setPage(0);
    syncUrl(appliedQuery, DEFAULT_FILTER, sort);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(0);
    syncUrl(appliedQuery, appliedFilter, newSort);
  };

  const handleRemoveChip = (key: keyof FilterState) => {
    const next = removeFilterKey(appliedFilter, key);
    setFilter(next);
    setAppliedFilter(next);
    setPage(0);
    syncUrl(appliedQuery, next, sort);
  };

  const handleClearAllFilters = () => handleResetFilter();

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleReviewSubmitted = useCallback(() => {
    void syncSummary();
  }, [syncSummary]);

  const handleCompareToggle = (dormId: number) => {
    setCompareIds((prev) => {
      if (prev.includes(dormId)) return prev.filter((id) => id !== dormId);
      if (prev.length >= 3) return prev;
      return [...prev, dormId];
    });
  };

  if (loading) {
    return (
      <div className="listings-page">
        <div className="listings-page__panel">
          <h1>Room Listings</h1>
          <SkeletonList count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="listings-page">
        <div className="listings-page__panel listings-page__panel--error">
          <h1>Room Listings</h1>
          <p className="listings-page__error">{error}</p>
          <button
            type="button"
            onClick={() => {
              clearDormCache();
              fetchDorms();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <div className="listings-page__panel" ref={panelRef}>
        <h1>Room Listings</h1>
        <p className="listings-page__count" aria-live="polite">
          {displayResults.length} room{displayResults.length !== 1 ? "s" : ""} found
        </p>

        <form className="listings-page__search" onSubmit={handleSearchSubmit}>
          <SearchAutocomplete
            value={searchTerm}
            onChange={setSearchTerm}
            suggestions={suggestions}
            onSelect={(name) => {
              setSearchTerm(name);
              setAppliedQuery(name);
              setPage(0);
              syncUrl(name, appliedFilter, sort);
              addRecentSearch(name);
            }}
            placeholder="Search by dorm, campus side, room type..."
            ariaLabel="Search listings"
          />
          <button type="submit">Search</button>
        </form>

        <FilterPanel
          filter={filter}
          onChange={setFilter}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />

        <FilterChips
          filter={appliedFilter}
          onRemove={handleRemoveChip}
          onClearAll={handleClearAllFilters}
        />

        <div className="listings-page__toolbar">
          <label className="listings-page__sort">
            Sort by
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="listings-page__favorites-toggle">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => {
                setShowFavoritesOnly(e.target.checked);
                setPage(0);
              }}
            />
            Favorites only
          </label>
          {compareIds.length > 0 && (
            <button type="button" className="listings-page__compare-btn" onClick={() => setShowCompare(true)}>
              Compare ({compareIds.length})
            </button>
          )}
        </div>

        {displayResults.length === 0 ? (
          <EmptyState onReset={handleClearAllFilters} />
        ) : (
          <>
            <ul className="listings-page__list">
              {pageResults.map((dorm) => (
                <li key={dorm.id}>
                  <DormCard
                    dorm={dorm}
                    rating={ratings.get(dorm.id) ?? 0}
                    reviewCount={reviewCounts.get(dorm.id) ?? 0}
                    onReviewSubmitted={handleReviewSubmitted}
                    compareSelected={compareIds.includes(dorm.id)}
                    onCompareToggle={() => handleCompareToggle(dorm.id)}
                    compareDisabled={compareIds.length >= 3 && !compareIds.includes(dorm.id)}
                  />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav className="listings-page__pagination" aria-label="Pagination">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </button>
                <span aria-current="page">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      {showCompare && (
        <CompareModal
          dorms={compareDorms}
          onClose={() => setShowCompare(false)}
          onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
        />
      )}
    </div>
  );
}
