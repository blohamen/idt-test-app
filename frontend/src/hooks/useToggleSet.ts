import { useState, useCallback } from 'react';

/**
 * Generic React hook for managing a reactive Set of unique items.
 * Useful for toggling selection, highlighting, active IDs, etc.
 */
export function useToggleSet<T>(initialValues?: Iterable<T>) {
  const [set, setSet] = useState<Set<T>>(() => new Set(initialValues));

  const toggle = useCallback((item: T) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }, []);

  const has = useCallback((item: T) => set.has(item), [set]);

  const add = useCallback((item: T) => {
    setSet((prev) => (prev.has(item) ? prev : new Set(prev).add(item)));
  }, []);

  const remove = useCallback((item: T) => {
    setSet((prev) => {
      if (!prev.has(item)) return prev;
      const next = new Set(prev);
      next.delete(item);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSet(new Set());
  }, []);

  return {
    set,
    toggle,
    has,
    add,
    remove,
    clear,
  };
}
