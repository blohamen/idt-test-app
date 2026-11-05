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

  // Cache and in-flight tracking to prevent duplicate network requests on double-clicks and repeated clicks
  const countiesCache = useRef<Record<string, County[]>>({});
  const inFlightState = useRef<string | null>(null);
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
    // If the state is already selected and its counties are loaded, do not re-fetch
    if (selectedStateRef.current?.state === state.state && countiesCache.current[state.state]) {
      return;
    }

    setSelectedState(state);

    // If counties are already cached, restore immediately without network request
    const cached = countiesCache.current[state.state];
    if (cached) {
      setCounties(cached);
      setIsCountiesLoading(false);
      setCountiesError(null);
      return;
    }

    // Prevent duplicate in-flight requests (e.g. during rapid single/double-clicks)
    if (inFlightState.current === state.state) {
      return;
    }

    inFlightState.current = state.state;
    setIsCountiesLoading(true);
    setCountiesError(null);

    fetchStateCounties(state.detail)
      .then((data) => {
        countiesCache.current[state.state] = data;
        setCounties(data);
        setIsCountiesLoading(false);
      })
      .catch((err) => {
        console.error(`[useStatesBrowser] Failed to load details for ${state.state}:`, err);
        setCountiesError(`Could not load county details for ${state.state}`);
        setIsCountiesLoading(false);
      })
      .finally(() => {
        if (inFlightState.current === state.state) {
          inFlightState.current = null;
        }
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
