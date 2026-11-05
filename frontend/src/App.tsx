import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { State, County } from './types';
import { fetchStates, fetchStateCounties } from './api/statesApi';
import { StateList } from './components/StateList/StateList';
import { SearchBox } from './components/SearchBox/SearchBox';
import { DetailPanel } from './components/DetailPanel/DetailPanel';
import styles from './App.module.css';

export const App: React.FC = () => {
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
          console.error('[App] Failed to load states:', err);
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
        console.error(`[App] Failed to load details for ${state.state}:`, err);
        setCountiesError(`Could not load county details for ${state.state}`);
        setIsCountiesLoading(false);
      })
      .finally(() => {
        if (inFlightState.current === state.state) {
          inFlightState.current = null;
        }
      });
  }, []);

  const handleToggleHighlight = (state: State) => {
    // Toggle highlight status in set
    setHighlightedStateNames((prev) => {
      const next = new Set(prev);
      if (next.has(state.state)) {
        next.delete(state.state);
      } else {
        next.add(state.state);
      }
      return next;
    });

    // Ensure state is selected without triggering duplicate fetch
    handleSelectState(state);
  };

  const filteredStatesForList2 = useMemo(() => {
    if (!searchQuery.trim()) {
      return states;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return states.filter((s) => s.state.toLowerCase().includes(lowerQuery));
  }, [states, searchQuery]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>US State Population Browser</h1>
          <p className={styles.subtitle}>
            Demographic integrity verification and synchronized dual-list state explorer
          </p>
        </div>
        <div className={styles.instructions}>
          <span className={styles.instructionItem}>
            <span className={styles.key}>Single-click:</span> View details
          </span>
          <span className={styles.instructionItem}>
            <span className={styles.key}>Double-click:</span> Toggle highlight
          </span>
        </div>
      </header>

      {statesError && (
        <div className={styles.errorBanner} role="alert">
          <strong>Error:</strong> {statesError}
        </div>
      )}

      {isStatesLoading ? (
        <div className={styles.loadingBanner}>Loading states data...</div>
      ) : (
        <main className={styles.columns}>
          {/* Column 1: State List #1 */}
          <section className={styles.column} aria-label="State List 1">
            <StateList
              title="State List #1"
              states={states}
              selectedStateName={selectedState?.state ?? null}
              highlightedStateNames={highlightedStateNames}
              onSelectState={handleSelectState}
              onToggleHighlight={handleToggleHighlight}
              testId="state-list-1"
            />
          </section>

          {/* Column 2: Search Box + State List #2 */}
          <section className={styles.column} aria-label="State List 2 with Search">
            <SearchBox
              query={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search List #2 (e.g., 'ne')..."
            />
            <StateList
              title="State List #2 (Filtered)"
              states={filteredStatesForList2}
              selectedStateName={selectedState?.state ?? null}
              highlightedStateNames={highlightedStateNames}
              onSelectState={handleSelectState}
              onToggleHighlight={handleToggleHighlight}
              emptyMessage={
                searchQuery
                  ? `No states matching "${searchQuery}"`
                  : 'No states to display'
              }
              testId="state-list-2"
            />
          </section>

          {/* Column 3: Detail Panel */}
          <section className={styles.column} aria-label="State Demographic Details">
            <DetailPanel
              selectedState={selectedState}
              counties={counties}
              isLoading={isCountiesLoading}
              error={countiesError}
            />
          </section>
        </main>
      )}
    </div>
  );
};

export default App;
