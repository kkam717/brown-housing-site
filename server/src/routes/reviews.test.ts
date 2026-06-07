import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../index.js";

const mockQuery = vi.fn();

vi.mock("../db/pool.js", () => ({
  getPool: () => ({ query: mockQuery }),
}));

describe("reviews routes", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it("GET /health returns ok without DB", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.uptime).toBe("number");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("GET /api/reviews/summary returns aggregated data", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { dorm_id: 1, count: "2", avg_rating: "4.5" },
        { dorm_id: 5, count: "1", avg_rating: "3" },
      ],
    });

    const res = await request(app).get("/api/reviews/summary");
    expect(res.status).toBe(200);
    expect(res.body["1"]).toEqual({ count: 2, avgRating: 4.5 });
    expect(res.body["5"]).toEqual({ count: 1, avgRating: 3 });
  });

  it("GET /api/reviews/:dormId strips email from response", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ fullname: "Jane", rating: 4, comment: "Nice" }],
    });

    const res = await request(app).get("/api/reviews/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ fullname: "Jane", review: 4, comment: "Nice" }]);
    expect(res.body[0].email).toBeUndefined();
  });

  it("GET /api/reviews/:dormId rejects invalid dorm id", async () => {
    const res = await request(app).get("/api/reviews/abc");
    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("POST /api/reviews validates required fields", async () => {
    const res = await request(app).post("/api/reviews").send({ dormId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name/i);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("POST /api/reviews inserts review", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/reviews")
      .send({
        dormId: 1,
        fullname: "Jane Doe",
        email: "jane@example.com",
        rating: 5,
        comment: "Great",
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO reviews"),
      [1, "jane_doe", "Jane Doe", "jane@example.com", 5, "Great"],
    );
  });

  it("POST /api/reviews upserts on duplicate user_key", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await request(app)
      .post("/api/reviews")
      .send({ dormId: 1, fullname: "Jane Doe", email: "j@x.com", rating: 3 });

    expect(mockQuery.mock.calls[0][0]).toContain("ON CONFLICT");
  });
});
