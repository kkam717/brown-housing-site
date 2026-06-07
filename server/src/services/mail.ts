import nodemailer, { type Transporter } from "nodemailer";

const DEFAULT_TO = "kiankamshad717@gmail.com";

export interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? "587");
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export function isMailConfigured(): boolean {
  return getTransporter() !== null;
}

export async function sendContactEmail(payload: ContactEmailPayload): Promise<void> {
  const mailer = getTransporter();
  if (!mailer) {
    throw new Error("Email is not configured on the server.");
  }

  const to = process.env.CONTACT_TO?.trim() || DEFAULT_TO;
  const from =
    process.env.CONTACT_FROM?.trim() || `"Brown Housing Site" <${process.env.SMTP_USER ?? to}>`;

  await mailer.sendMail({
    from,
    to,
    replyTo: payload.email,
    subject: `[Contact] ${payload.subject}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      "",
      payload.message,
    ].join("\n"),
    html: `
      <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></p>
      <hr />
      <p>${escapeHtml(payload.message).replace(/\n/g, "<br />")}</p>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
