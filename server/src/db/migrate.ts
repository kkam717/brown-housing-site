import "../loadEnv.js";
import { getPool, closePool, withDbRetry } from "./pool.js";

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  dorm_id    INTEGER NOT NULL,
  user_key   TEXT NOT NULL,
  fullname   TEXT NOT NULL,
  email      TEXT NOT NULL,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (dorm_id, user_key)
);

CREATE INDEX IF NOT EXISTS idx_reviews_dorm_id ON reviews (dorm_id);
`;

async function migrate(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set.\n\n" +
        "Add your Neon Postgres connection string to the project root .env:\n" +
        "  DATABASE_URL=postgresql://user:pass@host/db?sslmode=require\n\n" +
        "Get one free at https://neon.tech → create project → copy connection string.",
    );
    process.exit(1);
  }

  const pool = getPool();
  await withDbRetry(() => pool.query(MIGRATION_SQL));
  console.log("Migration complete.");
  await closePool();
}

migrate().catch((err) => {
  const code = (err as NodeJS.ErrnoException).code;
  console.error("Migration failed:", err);
  if (code === "ECONNRESET" || code === "ETIMEDOUT") {
    console.error(
      "\nNeon may be waking from sleep. Wait a few seconds and run `npm run migrate` again.",
    );
  }
  process.exit(1);
});
