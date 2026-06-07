import { useState } from "react";
import { isApiConfigured } from "../services/apiClient";
import { useReviewSync } from "../context/ReviewSyncContext";
import "./SyncStatusBanner.css";

const STATUS_MESSAGES: Partial<Record<string, string>> = {
  warming: "Connecting to review server…",
  syncing: "Updating reviews…",
  offline: "Showing cached reviews — server unavailable",
};

export default function SyncStatusBanner() {
  const { status } = useReviewSync();
  const [dismissed, setDismissed] = useState(false);

  if (!isApiConfigured()) return null;

  const message = STATUS_MESSAGES[status];
  if (!message || dismissed) return null;

  const showDismiss = status === "offline";

  return (
    <div
      className={`sync-banner sync-banner--${status}`}
      role={status === "offline" ? "alert" : "status"}
    >
      {(status === "warming" || status === "syncing") && (
        <span className="sync-banner__spinner" aria-hidden="true" />
      )}
      <span className="sync-banner__text">{message}</span>
      {showDismiss && (
        <button
          type="button"
          className="sync-banner__dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
