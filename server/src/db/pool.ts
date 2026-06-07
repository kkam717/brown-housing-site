import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function buildConnectionString(raw: string): string {
  if (raw.includes("localhost") || raw.includes("127.0.0.1")) {
    return raw;
  }

  const url = new URL(raw);
  if (!url.searchParams.has("uselibpqcompat")) {
    url.searchParams.set("uselibpqcompat", "true");
  }
  if (!url.searchParams.has("sslmode")) {
    url.searchParams.set("sslmode", "require");
  }
  return url.toString();
}

export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }

    const normalized = buildConnectionString(connectionString);
    const isLocal = normalized.includes("localhost") || normalized.includes("127.0.0.1");

    pool = new Pool({
      connectionString: normalized,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 15_000,
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  { attempts = 3, delayMs = 2000 } = {},
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const code = (err as NodeJS.ErrnoException).code;
      const retryable = code === "ECONNRESET" || code === "ETIMEDOUT" || code === "ENOTFOUND";
      if (!retryable || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError;
}
