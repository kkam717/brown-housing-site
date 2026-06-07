import { useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { submitContactForm } from "../services/contact";
import "./ContactPage.css";

export default function ContactPage() {
  useDocumentTitle("Contact");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setFeedback("");

    const result = await submitContactForm({
      name,
      email,
      subject,
      message,
      _honeypot: honeypot,
    });

    if (result.ok) {
      setStatus("success");
      setFeedback(result.message);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      return;
    }

    setStatus("error");
    setFeedback(result.message);
  };

  return (
    <div className="contact-page">
      <div className="contact-page__panel">
        <h1>Contact</h1>
        <p className="contact-page__intro">
          Questions about housing search, feedback on the site, or partnership inquiries — send us
          a message and we&apos;ll reply to your email.
        </p>

        <form className="contact-page__form" onSubmit={handleSubmit} noValidate>
          <label className="contact-page__honeypot" aria-hidden="true">
            Leave blank
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>

          <label>
            Name
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              maxLength={100}
              autoComplete="name"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              maxLength={254}
              autoComplete="email"
            />
          </label>

          <label>
            Subject
            <input
              type="text"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              required
              maxLength={200}
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              rows={6}
              required
              maxLength={5000}
            />
          </label>

          {status === "error" && (
            <p className="contact-page__error" role="alert">
              {feedback}
            </p>
          )}
          {status === "success" && (
            <p className="contact-page__success" role="status">
              {feedback}
            </p>
          )}

          <button type="submit" className="contact-page__submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
