import { useState, useRef, useCallback } from 'react';

export interface UseAsyncCachedDetailOptions<K, V, A = void> {
  fetcher: (key: K, args: A) => Promise<V>;
  getErrorMessage?: (key: K, error: unknown) => string;
}

/**
 * Generic React hook for fetching and caching detail resources by key.
 *
 * Capabilities:
 * - In-memory client cache (`Map<K, V>`)
 * - Deduplication of concurrent in-flight requests for the same key
 * - Out-of-order race condition guard (ignores stale async resolutions)
 * - Immediate clearing of stale data when switching to a non-cached resource
 */
export function useAsyncCachedDetail<K extends string | number, V, A = void>({
  fetcher,
  getErrorMessage = (key) => `Failed to load details for ${key}`,
}: UseAsyncCachedDetailOptions<K, V, A>) {
  const [data, setData] = useState<V | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<K | null>(null);

  const cache = useRef<Map<K, V>>(new Map());
  const inFlightRequests = useRef<Map<K, Promise<V>>>(new Map());
  const latestRequestedKeyRef = useRef<K | null>(null);

  const load = useCallback(
    (key: K, args: A) => {
      // If already active and present in cache, avoid redundant re-renders
      if (latestRequestedKeyRef.current === key && cache.current.has(key)) {
        return;
      }

      setActiveKey(key);
      latestRequestedKeyRef.current = key;

      // Restore immediately from cache if available
      const cached = cache.current.get(key);
      if (cached !== undefined) {
        setData(cached);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Reset stale data and error before fetching non-cached resource
      setData(null);
      setError(null);
      setIsLoading(true);

      // Deduplicate concurrent in-flight requests for this key
      let promise = inFlightRequests.current.get(key);
      if (!promise) {
        promise = fetcher(key, args);
        inFlightRequests.current.set(key, promise);
      }

      promise
        .then((result) => {
          cache.current.set(key, result);
          // Only update UI if this response belongs to the latest requested key
          if (latestRequestedKeyRef.current === key) {
            setData(result);
            setIsLoading(false);
            setError(null);
          }
        })
        .catch((err) => {
          // Only update UI if this response belongs to the latest requested key
          if (latestRequestedKeyRef.current === key) {
            setData(null);
            setError(getErrorMessage(key, err));
            setIsLoading(false);
          }
        })
        .finally(() => {
          inFlightRequests.current.delete(key);
        });
    },
    [fetcher, getErrorMessage]
  );

  const clear = useCallback(() => {
    latestRequestedKeyRef.current = null;
    setActiveKey(null);
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    activeKey,
    load,
    clear,
  };
}
