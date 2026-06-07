import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWithRetry } from "./apiClient";

describe("fetchWithRetry", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_URL", "https://api.example.com");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns data on successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      }),
    );

    const result = await fetchWithRetry<{ ok: boolean }>("/health");
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ ok: true });
  });

  it("retries on 503 and eventually succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const onRetry = vi.fn();
    const result = await fetchWithRetry<{ ok: boolean }>(
      "/health",
      {},
      { retries: 2, backoffMs: [1], onRetry },
    );

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledWith(1);
  });

  it("returns warming flag after exhausting retries on 503", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.resolve({}),
      }),
    );

    const result = await fetchWithRetry("/health", {}, { retries: 1, backoffMs: [1] });
    expect(result.ok).toBe(false);
    expect(result.warming).toBe(true);
  });

  it("returns error when API is not configured", async () => {
    vi.stubEnv("VITE_API_URL", "");
    const result = await fetchWithRetry("/health");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("API not configured");
  });
});
