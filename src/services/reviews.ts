import type { ReviewEntry } from "../types";
import {
  fetchWithRetry,
  isApiConfigured,
  pingHealth,
  type SyncStatus,
} from "./apiClient";
import {
  getAllCachedReviewStats,
  getCachedAverageRating,
  getCachedReviewCount,
  getCachedReviewsForDorm,
  getCachedSummary,
  updateDormReviews,
  updateSummary,
  upsertLocalReview,
  type ReviewSummary,
} from "./reviewCache";

type StatusListener = (status: SyncStatus) => void;
type CacheListener = () => void;

let currentStatus: SyncStatus = "idle";
const statusListeners = new Set<StatusListener>();
const cacheListeners = new Set<CacheListener>();

function setStatus(status: SyncStatus): void {
  if (currentStatus === status) return;
  currentStatus = status;
  for (const listener of statusListeners) listener(status);
}

export function getSyncStatus(): SyncStatus {
  return currentStatus;
}

export function subscribeSyncStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  listener(currentStatus);
  return () => statusListeners.delete(listener);
}

export function subscribeReviewCache(listener: CacheListener): () => void {
  cacheListeners.add(listener);
  return () => cacheListeners.delete(listener);
}

function notifyCacheUpdate(): void {
  for (const listener of cacheListeners) listener();
}

export function getReviewCount(dormId: number): number {
  return getCachedReviewCount(dormId);
}

export function getAverageRating(dormId: number): number {
  return getCachedAverageRating(dormId);
}

export function getReviewsForDorm(dormId: number): ReviewEntry[] {
  return getCachedReviewsForDorm(dormId);
}

export function getAllReviewStats(): { totalReviews: number; dormCount: number } {
  return getAllCachedReviewStats();
}

export async function warmupBackend(): Promise<boolean> {
  if (!isApiConfigured()) {
    setStatus("offline");
    return false;
  }

  setStatus("warming");
  const result = await pingHealth();
  if (result.ok) {
    setStatus("online");
    return true;
  }

  setStatus(result.warming ? "warming" : "offline");
  return false;
}

export async function syncReviewSummary(): Promise<void> {
  if (!isApiConfigured()) {
    setStatus("offline");
    return;
  }

  setStatus("syncing");
  const result = await fetchWithRetry<ReviewSummary>("/api/reviews/summary");

  if (result.ok && result.data) {
    updateSummary(result.data);
    notifyCacheUpdate();
    setStatus("online");
    return;
  }

  setStatus(result.warming ? "warming" : "offline");
}

export async function refreshReviewsForDorm(dormId: number): Promise<void> {
  if (!isApiConfigured()) return;

  const result = await fetchWithRetry<ReviewEntry[]>(`/api/reviews/${dormId}`);
  if (result.ok && result.data) {
    updateDormReviews(dormId, result.data);
    notifyCacheUpdate();
    setStatus("online");
  } else if (result.warming) {
    setStatus("warming");
  } else {
    setStatus("offline");
  }
}

export async function prefetchDormReviews(dormId: number): Promise<void> {
  await warmupBackend();
  await refreshReviewsForDorm(dormId);
}

function validateReviewInput(
  name: string,
  email: string,
  rating: number,
): { ok: true } | { ok: false; message: string } {
  if (!name.trim()) return { ok: false, message: "Please enter your name." };
  if (!email.trim()) return { ok: false, message: "Please enter your email." };
  if (rating < 1 || rating > 5) return { ok: false, message: "Please select a star rating." };
  return { ok: true };
}

export async function submitReview(
  dormId: number,
  name: string,
  email: string,
  rating: number,
  comment?: string,
  onRetry?: (attempt: number) => void,
): Promise<{ ok: boolean; message: string; warming?: boolean }> {
  const validation = validateReviewInput(name, email, rating);
  if (!validation.ok) return validation;

  if (!isApiConfigured()) {
    upsertLocalReview(dormId, name, email, rating, comment);
    notifyCacheUpdate();
    return { ok: true, message: "Review saved locally (API not configured)." };
  }

  setStatus("syncing");
  const result = await fetchWithRetry<{ ok: boolean; message: string }>(
    "/api/reviews",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dormId,
        fullname: name.trim(),
        email: email.trim(),
        rating,
        ...(comment?.trim() ? { comment: comment.trim() } : {}),
      }),
    },
    {
      timeoutMs: 90_000,
      retries: 5,
      backoffMs: [5000, 5000, 5000, 5000, 5000],
      onRetry,
    },
  );

  if (result.ok) {
    upsertLocalReview(dormId, name, email, rating, comment);
    await syncReviewSummary();
    await refreshReviewsForDorm(dormId);
    setStatus("online");
    return { ok: true, message: result.data?.message ?? "Review submitted!" };
  }

  if (result.warming) {
    setStatus("warming");
    return {
      ok: false,
      warming: true,
      message:
        "Waking review server — this can take up to a minute on first visit today. Retrying…",
    };
  }

  setStatus("offline");
  return { ok: false, message: result.error ?? "Failed to submit review." };
}

export function getCachedSummarySnapshot(): ReviewSummary {
  return getCachedSummary();
}
