import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { State, County } from '../types';
import { fetchStates, fetchStateCounties } from '../api/statesApi';

export function useStatesBrowser() {
  const [states, setStates] = useState<State[]>([]);
  const [highlightedStateNames, setHighlightedStateNames] = useState<Set<string>>(new Set());
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [counties, setCounties] = useState<County[] | null>(null);
  const [isCountiesLoading, setIsCountiesLoading] = useState<boolean>(false);
  const [countiesError, setCountiesError] = useState<string | null>(null);
  const [isStatesLoading, setIsStatesLoading] = useState<boolean>(true);
  const [statesError, setStatesError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cache and in-flight tracking to prevent duplicate network requests and race conditions
  const countiesCache = useRef<Record<string, County[]>>({});
  const inFlightRequests = useRef<Map<string, Promise<County[]>>>(new Map());
  const latestRequestedStateRef = useRef<string | null>(null);
  const selectedStateRef = useRef<State | null>(null);
  selectedStateRef.current = selectedState;

  useEffect(() => {
    let isMounted = true;
    setIsStatesLoading(true);

    fetchStates()
      .then((data) => {
        if (isMounted) {
          setStates(data);
          setIsStatesLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('[useStatesBrowser] Failed to load states:', err);
          setStatesError('Unable to connect to the backend API. Please ensure the server is running.');
          setIsStatesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectState = useCallback((state: State) => {
    const stateName = state.state;

    // If the state is already selected and its counties are loaded, do not re-fetch
    if (selectedStateRef.current?.state === stateName && countiesCache.current[stateName]) {
      return;
    }

    setSelectedState(state);
    latestRequestedStateRef.current = stateName;

    // If counties are already cached, restore immediately without network request
    const cached = countiesCache.current[stateName];
    if (cached) {
      setCounties(cached);
      setIsCountiesLoading(false);
      setCountiesError(null);
      return;
    }

    // Immediately clear previous state counties and errors to avoid showing stale data
    setCounties(null);
    setCountiesError(null);
    setIsCountiesLoading(true);

    // Reuse in-flight promise if available, or create a new one
    let promise = inFlightRequests.current.get(stateName);
    if (!promise) {
      promise = fetchStateCounties(state.detail);
      inFlightRequests.current.set(stateName, promise);
    }

    promise
      .then((data) => {
        countiesCache.current[stateName] = data;
        // Only update UI state if this is still the latest requested state
        if (latestRequestedStateRef.current === stateName) {
          setCounties(data);
          setIsCountiesLoading(false);
          setCountiesError(null);
        }
      })
      .catch((err) => {
        console.error(`[useStatesBrowser] Failed to load details for ${stateName}:`, err);
        // Only update UI state if this is still the latest requested state
        if (latestRequestedStateRef.current === stateName) {
          setCounties(null);
          setCountiesError(`Could not load county details for ${stateName}`);
          setIsCountiesLoading(false);
        }
      })
      .finally(() => {
        inFlightRequests.current.delete(stateName);
      });
  }, []);

  const handleToggleHighlight = useCallback((state: State) => {
    setHighlightedStateNames((prev) => {
      const next = new Set(prev);
      if (next.has(state.state)) {
        next.delete(state.state);
      } else {
        next.add(state.state);
      }
      return next;
    });

    handleSelectState(state);
  }, [handleSelectState]);

  const filteredStatesForList2 = useMemo(() => {
    if (!searchQuery.trim()) {
      return states;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return states.filter((s) => s.state.toLowerCase().includes(lowerQuery));
  }, [states, searchQuery]);

  return {
    states,
    isStatesLoading,
    statesError,
    selectedState,
    counties,
    isCountiesLoading,
    countiesError,
    highlightedStateNames,
    searchQuery,
    setSearchQuery,
    filteredStatesForList2,
    handleSelectState,
    handleToggleHighlight,
  };
}
