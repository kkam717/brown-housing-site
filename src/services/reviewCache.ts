import type { ReviewEntry } from "../types";

const SUMMARY_KEY = "brown-housing-reviews-summary";
const DORM_KEY_PREFIX = "brown-housing-reviews-dorm-";

export interface SummaryEntry {
  count: number;
  avgRating: number;
}

export type ReviewSummary = Record<string, SummaryEntry>;

interface CachedDormReviews {
  reviews: ReviewEntry[];
  fetchedAt: number;
}

type ReviewStore = Record<string, Record<string, ReviewEntry>>;

const LEGACY_STORAGE_KEY = "brown-housing-reviews";

function readSummary(): ReviewSummary {
  try {
    const raw = localStorage.getItem(SUMMARY_KEY);
    return raw ? (JSON.parse(raw) as ReviewSummary) : {};
  } catch {
    return {};
  }
}

function writeSummary(summary: ReviewSummary): void {
  localStorage.setItem(SUMMARY_KEY, JSON.stringify(summary));
}

function readDormCache(dormId: number): CachedDormReviews | null {
  try {
    const raw = localStorage.getItem(`${DORM_KEY_PREFIX}${dormId}`);
    return raw ? (JSON.parse(raw) as CachedDormReviews) : null;
  } catch {
    return null;
  }
}

function writeDormCache(dormId: number, reviews: ReviewEntry[]): void {
  const payload: CachedDormReviews = { reviews, fetchedAt: Date.now() };
  localStorage.setItem(`${DORM_KEY_PREFIX}${dormId}`, JSON.stringify(payload));
}

function migrateLegacyStore(): void {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;

    const store = JSON.parse(raw) as ReviewStore;
    const summary: ReviewSummary = {};

    for (const [dormKey, dormReviews] of Object.entries(store)) {
      const entries = Object.values(dormReviews);
      if (entries.length === 0) continue;

      const ratings = entries.map((e) => e.review);
      summary[dormKey] = {
        count: entries.length,
        avgRating: ratings.reduce((s, r) => s + r, 0) / ratings.length,
      };
      writeDormCache(Number(dormKey), entries);
    }

    if (Object.keys(summary).length > 0) {
      writeSummary(summary);
    }
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore corrupt legacy data */
  }
}

migrateLegacyStore();

export function getCachedSummary(): ReviewSummary {
  return readSummary();
}

export function getCachedReviewCount(dormId: number): number {
  const summary = readSummary();
  return summary[String(dormId)]?.count ?? 0;
}

export function getCachedAverageRating(dormId: number): number {
  const summary = readSummary();
  return summary[String(dormId)]?.avgRating ?? 0;
}

export function getCachedReviewsForDorm(dormId: number): ReviewEntry[] {
  return readDormCache(dormId)?.reviews ?? [];
}

export function updateSummary(summary: ReviewSummary): void {
  writeSummary(summary);
}

export function updateDormReviews(dormId: number, reviews: ReviewEntry[]): void {
  writeDormCache(dormId, reviews);

  const summary = readSummary();
  const key = String(dormId);
  if (reviews.length === 0) {
    delete summary[key];
  } else {
    const avgRating = reviews.reduce((s, r) => s + r.review, 0) / reviews.length;
    summary[key] = { count: reviews.length, avgRating };
  }
  writeSummary(summary);
}

export function upsertLocalReview(
  dormId: number,
  name: string,
  email: string,
  rating: number,
  comment?: string,
): ReviewEntry {
  const userKey = name.toLowerCase().replace(/\s+/g, "_");
  const entry: ReviewEntry = {
    fullname: name.trim(),
    email: email.trim(),
    review: rating,
    ...(comment?.trim() ? { comment: comment.trim() } : {}),
  };

  const existing = getCachedReviewsForDorm(dormId);
  const byUser = new Map(
    existing.map((r) => [r.fullname.toLowerCase().replace(/\s+/g, "_"), r]),
  );
  byUser.set(userKey, entry);
  const merged = [...byUser.values()];
  updateDormReviews(dormId, merged);
  return entry;
}

export function getAllCachedReviewStats(): { totalReviews: number; dormCount: number } {
  const summary = readSummary();
  let totalReviews = 0;
  for (const entry of Object.values(summary)) {
    totalReviews += entry.count;
  }
  return { totalReviews, dormCount: Object.keys(summary).length };
}
