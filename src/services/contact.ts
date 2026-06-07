import { fetchWithRetry, isApiConfigured } from "./apiClient";

export const CONTACT_EMAIL = "kiankamshad717@gmail.com";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  _honeypot?: string;
}

export interface ContactResult {
  ok: boolean;
  message: string;
}

async function submitViaApi(data: ContactFormData): Promise<ContactResult> {
  const result = await fetchWithRetry<{ ok: boolean; message?: string }>(
    "/api/contact",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    { retries: 0, timeoutMs: 30_000 },
  );

  if (result.ok && result.data) {
    return { ok: true, message: result.data.message ?? "Message sent!" };
  }

  return { ok: false, message: result.error ?? "Failed to send message." };
}

async function submitViaFormSubmit(data: ContactFormData): Promise<ContactResult> {
  const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      _honey: data._honeypot ?? "",
      _captcha: "false",
    }),
  });

  if (!response.ok) {
    return { ok: false, message: "Failed to send message. Please try again." };
  }

  const body = (await response.json()) as { success?: string; message?: string };
  if (body.success === "true" || body.message?.toLowerCase().includes("success")) {
    return { ok: true, message: "Message sent! We'll get back to you soon." };
  }

  return { ok: false, message: body.message ?? "Failed to send message." };
}

export async function submitContactForm(data: ContactFormData): Promise<ContactResult> {
  if (data._honeypot?.trim()) {
    return { ok: true, message: "Message sent!" };
  }

  if (isApiConfigured()) {
    const apiResult = await submitViaApi(data);
    if (apiResult.ok) return apiResult;
    if (!apiResult.message.includes("not configured")) {
      return apiResult;
    }
  }

  return submitViaFormSubmit(data);
}
