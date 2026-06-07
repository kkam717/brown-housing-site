import { useEffect, useMemo, useRef, useState } from "react";
import {
  getReviewsForDorm,
  prefetchDormReviews,
  refreshReviewsForDorm,
  submitReview,
} from "../services/reviews";
import { useReviewSync } from "../context/ReviewSyncContext";
import StarRating from "./StarRating";
import "./ReviewModal.css";

interface Props {
  dormId: number;
  onSubmitted: () => void;
}

export default function ReviewModal({ dormId, onSubmitted }: Props) {
  const { cacheVersion } = useReviewSync();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const existingReviews = useMemo(() => {
    if (!open) return [];
    return getReviewsForDorm(dormId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dormId, cacheVersion]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    first?.focus();

    void refreshReviewsForDorm(dormId);

    return () => window.removeEventListener("keydown", onKey);
  }, [open, dormId, submitting]);

  useEffect(() => {
    if (open) return;
    triggerRef.current?.focus();
  }, [open]);

  const reset = () => {
    setName("");
    setEmail("");
    setRating(0);
    setComment("");
    setMessage("");
    setError("");
    setSubmitting(false);
    setRetryAttempt(0);
  };

  const handlePrefetch = () => {
    void prefetchDormReviews(dormId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    setRetryAttempt(0);

    const result = await submitReview(dormId, name, email, rating, comment, (attempt) => {
      setRetryAttempt(attempt);
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessage(result.message);
    onSubmitted();
    setTimeout(() => {
      setOpen(false);
      reset();
    }, 1200);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="review-modal__trigger"
        onClick={() => setOpen(true)}
        onMouseEnter={handlePrefetch}
        onFocus={handlePrefetch}
      >
        Review
      </button>

      {open && (
        <div className="review-modal__overlay" onClick={() => !submitting && setOpen(false)}>
          <div
            ref={dialogRef}
            className="review-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="review-modal__header">
              <h2 id="review-title">Rate Your Room</h2>
              <button
                type="button"
                className="review-modal__close"
                aria-label="Close"
                disabled={submitting}
                onClick={() => setOpen(false)}
              >
                &times;
              </button>
            </div>

            {existingReviews.length > 0 && (
              <div className="review-modal__existing" aria-live="polite">
                <h3>Previous reviews ({existingReviews.length})</h3>
                <ul>
                  {existingReviews.map((r) => (
                    <li key={r.fullname}>
                      <strong>{r.fullname}</strong> — {"★".repeat(r.review)}
                      {r.comment && <p>{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form className="review-modal__body" onSubmit={handleSubmit}>
              <p className="review-modal__disclaimer">
                Reviews are shared with all visitors. Cached reviews may appear while the server
                connects.
              </p>
              <label>
                Full name
                <input
                  type="text"
                  value={name}
                  placeholder="Your name"
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </label>
              <StarRating rating={rating} onChange={setRating} />
              <label>
                Comment (optional)
                <textarea
                  value={comment}
                  placeholder="Share your experience..."
                  rows={3}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={submitting}
                />
              </label>
              {submitting && (
                <div className="review-modal__warming" role="status">
                  <div className="review-modal__progress" aria-hidden="true" />
                  <p>
                    {retryAttempt > 0
                      ? "Waking review server — this can take up to a minute on first visit today…"
                      : "Submitting review…"}
                  </p>
                </div>
              )}
              {error && (
                <p className="review-modal__error" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="review-modal__success" role="status">
                  {message}
                </p>
              )}
              <div className="review-modal__footer">
                <button
                  type="button"
                  className="review-modal__cancel"
                  disabled={submitting}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="review-modal__submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
