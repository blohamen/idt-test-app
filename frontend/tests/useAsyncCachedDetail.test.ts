import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsyncCachedDetail } from '../src/hooks/useAsyncCachedDetail';

describe('useAsyncCachedDetail generic hook', () => {
  it('loads and caches data for a key', async () => {
    const fetcher = vi.fn().mockResolvedValue(['Item 1', 'Item 2']);

    const { result } = renderHook(() =>
      useAsyncCachedDetail<string, string[]>({
        fetcher,
      })
    );

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      result.current.load('key-1');
    });

    expect(result.current.data).toEqual(['Item 1', 'Item 2']);
    expect(result.current.isLoading).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Subsequent call for the same key restores from cache without calling fetcher again
    await act(async () => {
      result.current.load('key-1');
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('handles race conditions by only displaying the latest requested key', async () => {
    const fetcher = vi.fn().mockImplementation(async (key: string) => {
      if (key === 'slow') {
        await new Promise((r) => setTimeout(r, 60));
        return 'slow result';
      }
      if (key === 'fast') {
        await new Promise((r) => setTimeout(r, 10));
        return 'fast result';
      }
      return 'default';
    });

    const { result } = renderHook(() =>
      useAsyncCachedDetail<string, string>({
        fetcher,
      })
    );

    // Trigger slow first, then immediately fast
    act(() => {
      result.current.load('slow');
      result.current.load('fast');
    });

    // Wait until fast completes
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(result.current.data).toBe('fast result');

    // Wait past slow's resolution
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
    });

    // Stale slow response must not overwrite the latest active fast result
    expect(result.current.data).toBe('fast result');
  });

  it('clears stale data immediately when loading a new uncached key', async () => {
    let resolvePromise: (val: string) => void;
    const fetcher = vi.fn().mockImplementation((key: string) => {
      if (key === 'second') {
        return new Promise<string>((resolve) => {
          resolvePromise = resolve;
        });
      }
      return Promise.resolve('first result');
    });

    const { result } = renderHook(() =>
      useAsyncCachedDetail<string, string>({
        fetcher,
      })
    );

    await act(async () => {
      result.current.load('first');
    });
    expect(result.current.data).toBe('first result');

    // Load second: data should be immediately cleared while in flight
    act(() => {
      result.current.load('second');
    });
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!('second result');
    });
    expect(result.current.data).toBe('second result');
  });

  it('sets formatted error when fetcher rejects', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() =>
      useAsyncCachedDetail<string, string>({
        fetcher,
        getErrorMessage: (k) => `Failed loading ${k}`,
      })
    );

    await act(async () => {
      result.current.load('error-key');
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Failed loading error-key');
    expect(result.current.isLoading).toBe(false);
  });
});
