import { useState, useEffect, useMemo, useCallback } from 'react';
import { State, County } from '../types';
import { fetchStates, fetchStateCounties } from '../api/statesApi';
import { useToggleSet } from './useToggleSet';
import { useAsyncCachedDetail } from './useAsyncCachedDetail';

/**
 * Domain-specific orchestration hook for the US State Population Browser application.
 * Composes generic hooks (useToggleSet, useAsyncCachedDetail) with domain state and API calls.
 */
export function useStatesBrowser() {
  const [states, setStates] = useState<State[]>([]);
  const [isStatesLoading, setIsStatesLoading] = useState<boolean>(true);
  const [statesError, setStatesError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Generic hook managing the Set of highlighted state names
  const { set: highlightedStateNames, toggle: toggleHighlight } = useToggleSet<string>();

  // Generic hook managing county detail fetching, client caching, race conditions, and in-flight deduplication
  const {
    data: counties,
    isLoading: isCountiesLoading,
    error: countiesError,
    load: loadCounties,
  } = useAsyncCachedDetail<string, County[], string>({
    fetcher: (_stateName, detailUrl) => fetchStateCounties(detailUrl),
    getErrorMessage: (stateName) => `Could not load county details for ${stateName}`,
  });

  // Initial load of the 51 US states
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

  const handleSelectState = useCallback(
    (state: State) => {
      setSelectedState(state);
      loadCounties(state.state, state.detail);
    },
    [loadCounties]
  );

  const handleToggleHighlight = useCallback(
    (state: State) => {
      toggleHighlight(state.state);
      handleSelectState(state);
    },
    [toggleHighlight, handleSelectState]
  );

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
