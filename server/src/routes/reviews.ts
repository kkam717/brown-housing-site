import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { getPool } from "../db/pool.js";
import { normalizeUserKey } from "../utils/userKey.js";

export interface ReviewRow {
  fullname: string;
  rating: number;
  comment: string | null;
}

export interface SummaryEntry {
  count: number;
  avgRating: number;
}

const postLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Too many review submissions. Please try again later." },
});

function validateReviewBody(body: unknown): {
  ok: true;
  data: { dormId: number; fullname: string; email: string; rating: number; comment?: string };
} | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Invalid request body." };
  }

  const { dormId, fullname, email, rating, comment } = body as Record<string, unknown>;

  if (typeof dormId !== "number" || !Number.isInteger(dormId) || dormId < 1) {
    return { ok: false, message: "Invalid dorm ID." };
  }
  if (typeof fullname !== "string" || !fullname.trim()) {
    return { ok: false, message: "Please enter your name." };
  }
  if (typeof email !== "string" || !email.trim()) {
    return { ok: false, message: "Please enter your email." };
  }
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return { ok: false, message: "Please select a star rating." };
  }

  return {
    ok: true,
    data: {
      dormId,
      fullname: fullname.trim(),
      email: email.trim(),
      rating,
      ...(typeof comment === "string" && comment.trim() ? { comment: comment.trim() } : {}),
    },
  };
}

export const reviewsRouter = Router();

reviewsRouter.get("/summary", async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    const result = await pool.query<{ dorm_id: number; count: string; avg_rating: string }>(
      `SELECT dorm_id, COUNT(*)::text AS count, COALESCE(AVG(rating), 0)::text AS avg_rating
       FROM reviews
       GROUP BY dorm_id`,
    );

    const summary: Record<string, SummaryEntry> = {};
    for (const row of result.rows) {
      summary[String(row.dorm_id)] = {
        count: Number(row.count),
        avgRating: Number(row.avg_rating),
      };
    }

    res.json(summary);
  } catch (err) {
    console.error("GET /api/reviews/summary failed:", err);
    res.status(500).json({ ok: false, message: "Failed to load review summary." });
  }
});

reviewsRouter.get("/:dormId", async (req: Request, res: Response) => {
  const dormId = Number(req.params.dormId);
  if (!Number.isInteger(dormId) || dormId < 1) {
    res.status(400).json({ ok: false, message: "Invalid dorm ID." });
    return;
  }

  try {
    const pool = getPool();
    const result = await pool.query<ReviewRow>(
      `SELECT fullname, rating, comment
       FROM reviews
       WHERE dorm_id = $1
       ORDER BY created_at DESC`,
      [dormId],
    );

    const reviews = result.rows.map((row) => ({
      fullname: row.fullname,
      review: row.rating,
      ...(row.comment ? { comment: row.comment } : {}),
    }));

    res.json(reviews);
  } catch (err) {
    console.error(`GET /api/reviews/${dormId} failed:`, err);
    res.status(500).json({ ok: false, message: "Failed to load reviews." });
  }
});

reviewsRouter.post("/", postLimiter, async (req: Request, res: Response) => {
  const validated = validateReviewBody(req.body);
  if (!validated.ok) {
    res.status(400).json({ ok: false, message: validated.message });
    return;
  }

  const { dormId, fullname, email, rating, comment } = validated.data;
  const userKey = normalizeUserKey(fullname);

  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO reviews (dorm_id, user_key, fullname, email, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (dorm_id, user_key)
       DO UPDATE SET fullname = EXCLUDED.fullname,
                     email = EXCLUDED.email,
                     rating = EXCLUDED.rating,
                     comment = EXCLUDED.comment,
                     created_at = now()`,
      [dormId, userKey, fullname, email, rating, comment ?? null],
    );

    res.status(201).json({ ok: true, message: "Review submitted!" });
  } catch (err) {
    console.error("POST /api/reviews failed:", err);
    res.status(500).json({ ok: false, message: "Failed to submit review." });
  }
});
