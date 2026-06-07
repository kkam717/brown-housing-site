import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  submitReview,
  getAverageRating,
  getReviewCount,
  getReviewsForDorm,
  syncReviewSummary,
} from "./reviews";

describe("reviews", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads from cache synchronously", () => {
    localStorage.setItem(
      "brown-housing-reviews-summary",
      JSON.stringify({ "1": { count: 2, avgRating: 4.5 } }),
    );
    localStorage.setItem(
      "brown-housing-reviews-dorm-1",
      JSON.stringify({
        reviews: [
          { fullname: "Jane", email: "j@x.com", review: 5, comment: "Great room!" },
        ],
        fetchedAt: Date.now(),
      }),
    );

    expect(getReviewCount(1)).toBe(2);
    expect(getAverageRating(1)).toBe(4.5);
    expect(getReviewsForDorm(1)[0].comment).toBe("Great room!");
  });

  it("submits locally when API is not configured", async () => {
    const result = await submitReview(1, "Jane Doe", "jane@example.com", 4, "Nice");
    expect(result.ok).toBe(true);
    expect(getReviewCount(1)).toBe(1);
    expect(getAverageRating(1)).toBe(4);
  });

  it("rejects invalid submissions before network", async () => {
    expect((await submitReview(1, "", "jane@example.com", 4)).ok).toBe(false);
    expect((await submitReview(1, "Jane", "", 4)).ok).toBe(false);
    expect((await submitReview(1, "Jane", "jane@example.com", 0)).ok).toBe(false);
  });

  it("syncs summary from API into cache", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.com");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ "1": { count: 3, avgRating: 4 } }),
      }),
    );

    await syncReviewSummary();
    expect(getReviewCount(1)).toBe(3);
    expect(getAverageRating(1)).toBe(4);
  });

  it("returns 0 average when no reviews exist", () => {
    expect(getAverageRating(99)).toBe(0);
    expect(getReviewCount(99)).toBe(0);
  });
});
