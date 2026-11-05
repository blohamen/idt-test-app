import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggleSet } from '../src/hooks/useToggleSet';

describe('useToggleSet generic hook', () => {
  it('initializes with empty set or provided initial values', () => {
    const { result: emptyResult } = renderHook(() => useToggleSet<string>());
    expect(emptyResult.current.set.size).toBe(0);

    const { result: filledResult } = renderHook(() => useToggleSet<string>(['Alabama', 'Alaska']));
    expect(filledResult.current.set.size).toBe(2);
    expect(filledResult.current.has('Alabama')).toBe(true);
    expect(filledResult.current.has('Texas')).toBe(false);
  });

  it('toggles items in and out of the set', () => {
    const { result } = renderHook(() => useToggleSet<string>());

    act(() => {
      result.current.toggle('California');
    });
    expect(result.current.has('California')).toBe(true);

    act(() => {
      result.current.toggle('California');
    });
    expect(result.current.has('California')).toBe(false);
  });

  it('adds and removes items explicitly', () => {
    const { result } = renderHook(() => useToggleSet<number>());

    act(() => {
      result.current.add(42);
    });
    expect(result.current.has(42)).toBe(true);

    act(() => {
      result.current.remove(42);
    });
    expect(result.current.has(42)).toBe(false);
  });

  it('clears all items from the set', () => {
    const { result } = renderHook(() => useToggleSet<string>(['A', 'B', 'C']));
    expect(result.current.set.size).toBe(3);

    act(() => {
      result.current.clear();
    });
    expect(result.current.set.size).toBe(0);
  });
});
