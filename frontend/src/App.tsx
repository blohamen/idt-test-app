import React from 'react';
import { useStatesBrowser } from './hooks/useStatesBrowser';
import { Header } from './components/Header/Header';
import { StateList } from './components/StateList/StateList';
import { SearchBox } from './components/SearchBox/SearchBox';
import { DetailPanel } from './components/DetailPanel/DetailPanel';
import styles from './App.module.css';

export const App: React.FC = () => {
  const {
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
  } = useStatesBrowser();

  return (
    <div className={styles.app}>
      <Header />

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
                searchQuery ? `No states matching "${searchQuery}"` : 'No states to display'
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
