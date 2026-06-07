import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { isMailConfigured, sendContactEmail } from "../services/mail.js";

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Too many messages. Please try again later." },
});

function validateBody(body: unknown):
  | { ok: true; data: { name: string; email: string; subject: string; message: string } }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Invalid request body." };
  }

  const { name, email, subject, message, _honeypot } = body as Record<string, unknown>;

  if (typeof _honeypot === "string" && _honeypot.trim()) {
    return { ok: true, data: { name: "", email: "", subject: "", message: "" } };
  }

  if (typeof name !== "string" || !name.trim()) {
    return { ok: false, message: "Please enter your name." };
  }
  if (name.trim().length > 100) {
    return { ok: false, message: "Name is too long." };
  }
  if (typeof email !== "string" || !email.trim() || !EMAIL_RE.test(email.trim())) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (email.trim().length > 254) {
    return { ok: false, message: "Email is too long." };
  }
  if (typeof subject !== "string" || !subject.trim()) {
    return { ok: false, message: "Please enter a subject." };
  }
  if (subject.trim().length > 200) {
    return { ok: false, message: "Subject is too long." };
  }
  if (typeof message !== "string" || !message.trim()) {
    return { ok: false, message: "Please enter a message." };
  }
  if (message.trim().length > 5000) {
    return { ok: false, message: "Message is too long." };
  }

  return {
    ok: true,
    data: {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    },
  };
}

export const contactRouter = Router();

contactRouter.post("/", postLimiter, async (req: Request, res: Response) => {
  const validated = validateBody(req.body);
  if (!validated.ok) {
    res.status(400).json({ ok: false, message: validated.message });
    return;
  }

  if (!validated.data.name) {
    res.json({ ok: true, message: "Message sent!" });
    return;
  }

  if (!isMailConfigured()) {
    res.status(503).json({
      ok: false,
      message: "Contact email is not configured on the server.",
    });
    return;
  }

  try {
    await sendContactEmail(validated.data);
    res.json({ ok: true, message: "Message sent! We'll get back to you soon." });
  } catch (err) {
    console.error("Contact email failed:", err);
    res.status(500).json({ ok: false, message: "Failed to send message. Please try again." });
  }
});
