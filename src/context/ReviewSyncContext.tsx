import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SyncStatus } from "../services/apiClient";
import {
  getSyncStatus,
  subscribeReviewCache,
  subscribeSyncStatus,
  syncReviewSummary,
  warmupBackend,
} from "../services/reviews";

interface ReviewSyncContextValue {
  status: SyncStatus;
  cacheVersion: number;
  warmup: () => Promise<boolean>;
  syncSummary: () => Promise<void>;
}

const ReviewSyncContext = createContext<ReviewSyncContextValue | null>(null);

export function ReviewSyncProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus);
  const [cacheVersion, setCacheVersion] = useState(0);

  useEffect(() => {
    return subscribeSyncStatus(setStatus);
  }, []);

  useEffect(() => {
    return subscribeReviewCache(() => setCacheVersion((v) => v + 1));
  }, []);

  const warmup = useCallback(() => warmupBackend(), []);
  const syncSummary = useCallback(() => syncReviewSummary(), []);

  const value = useMemo(
    () => ({ status, cacheVersion, warmup, syncSummary }),
    [status, cacheVersion, warmup, syncSummary],
  );

  return <ReviewSyncContext.Provider value={value}>{children}</ReviewSyncContext.Provider>;
}

export function useReviewSync(): ReviewSyncContextValue {
  const ctx = useContext(ReviewSyncContext);
  if (!ctx) {
    throw new Error("useReviewSync must be used within ReviewSyncProvider");
  }
  return ctx;
}
