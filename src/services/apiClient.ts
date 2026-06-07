export type SyncStatus = "idle" | "warming" | "syncing" | "online" | "offline";

export interface FetchResult<T> {
  ok: boolean;
  data?: T;
  warming?: boolean;
  error?: string;
}

export interface FetchWithRetryOptions {
  timeoutMs?: number;
  retries?: number;
  backoffMs?: number[];
  onRetry?: (attempt: number) => void;
}

const WARMING_STATUSES = new Set([502, 503, 504]);

export function getApiBaseUrl(): string | null {
  const url = import.meta.env.VITE_API_URL;
  if (!url || typeof url !== "string") return null;
  return url.replace(/\/$/, "");
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl() !== null;
}

function isWarmingResponse(status: number): boolean {
  return WARMING_STATUSES.has(status);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithRetry<T>(
  path: string,
  init: RequestInit = {},
  options: FetchWithRetryOptions = {},
): Promise<FetchResult<T>> {
  const base = getApiBaseUrl();
  if (!base) {
    return { ok: false, error: "API not configured" };
  }

  const {
    timeoutMs = 90_000,
    retries = 2,
    backoffMs = [2000, 5000],
    onRetry,
  } = options;

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  let lastError = "Request failed";

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      onRetry?.(attempt);
      const delay = backoffMs[Math.min(attempt - 1, backoffMs.length - 1)] ?? 5000;
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const response = await fetchWithTimeout(url, init, timeoutMs);

      if (isWarmingResponse(response.status)) {
        lastError = "Server is waking up";
        continue;
      }

      if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
          const body = (await response.json()) as { message?: string };
          if (body.message) message = body.message;
        } catch {
          /* ignore parse errors */
        }
        return { ok: false, error: message };
      }

      if (response.status === 204) {
        return { ok: true, data: undefined as T };
      }

      const data = (await response.json()) as T;
      return { ok: true, data };
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      lastError = isAbort ? "Request timed out" : "Network error";
    }
  }

  return { ok: false, warming: true, error: lastError };
}

export async function pingHealth(): Promise<FetchResult<{ ok: boolean; uptime: number }>> {
  return fetchWithRetry("/health", { method: "GET" }, { retries: 1, timeoutMs: 90_000 });
}
