import { useEffect } from "react";
import { isApiConfigured } from "../services/apiClient";
import { useReviewSync } from "../context/ReviewSyncContext";

export function useBackendWarmup(): void {
  const { warmup, syncSummary } = useReviewSync();

  useEffect(() => {
    if (!isApiConfigured()) return;

    void (async () => {
      const ready = await warmup();
      if (ready) {
        await syncSummary();
      }
    })();
  }, [warmup, syncSummary]);
}
