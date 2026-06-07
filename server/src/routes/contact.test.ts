import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../index.js";

vi.mock("../services/mail.js", () => ({
  isMailConfigured: vi.fn(() => true),
  sendContactEmail: vi.fn(async () => undefined),
}));

import { isMailConfigured, sendContactEmail } from "../services/mail.js";

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.mocked(isMailConfigured).mockReturnValue(true);
    vi.mocked(sendContactEmail).mockClear();
  });

  it("accepts a valid contact submission", async () => {
    const res = await request(app).post("/api/contact").send({
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Question about Olney",
      message: "Hello, I have a question about room sizes.",
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(sendContactEmail).toHaveBeenCalledOnce();
  });

  it("rejects missing fields", async () => {
    const res = await request(app).post("/api/contact").send({ name: "Jane" });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it("silently accepts honeypot submissions", async () => {
    const res = await request(app).post("/api/contact").send({
      name: "Bot",
      email: "bot@example.com",
      subject: "spam",
      message: "spam",
      _honeypot: "filled",
    });

    expect(res.status).toBe(200);
    expect(sendContactEmail).not.toHaveBeenCalled();
  });
});
