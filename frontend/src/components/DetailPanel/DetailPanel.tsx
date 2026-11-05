import React from 'react';
import { State, County } from '../../types';
import { CountyList } from '../CountyList/CountyList';
import styles from './DetailPanel.module.css';

interface DetailPanelProps {
  selectedState: State | null;
  counties: County[] | null;
  isLoading: boolean;
  error?: string | null;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  selectedState,
  counties,
  isLoading,
  error,
}) => {
  if (!selectedState) {
    return (
      <div className={styles.panel} data-testid="detail-panel">
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon} aria-hidden="true">
            🗺️
          </div>
          <div className={styles.placeholderText}>
            Select a state from either list to view details and county demographics
          </div>
        </div>
      </div>
    );
  }

  const countySum = counties ? counties.reduce((sum, c) => sum + c.population, 0) : 0;

  const isMatch = counties !== null && countySum === selectedState.population;
  const difference = countySum - selectedState.population;

  return (
    <div className={styles.panel} data-testid="detail-panel">
      <div className={styles.header}>
        <h2 className={styles.stateTitle}>{selectedState.state}</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Recorded Population</div>
            <div className={styles.statValue}>
              {selectedState.population.toLocaleString('en-US')}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Recorded Counties</div>
            <div className={styles.statValue}>{selectedState.counties}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Sum of Counties</div>
            <div className={styles.statValue}>
              {isLoading ? 'Calculating...' : countySum.toLocaleString('en-US')}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Loaded Counties</div>
            <div className={styles.statValue}>{counties ? counties.length : '...'}</div>
          </div>
        </div>
      </div>

      <div className={styles.comparisonSection}>
        {isLoading ? (
          <div className={styles.loading}>Loading county data...</div>
        ) : error ? (
          <div className={`${styles.matchBanner} ${styles.matchMismatch}`}>
            <span>⚠️ {error}</span>
          </div>
        ) : isMatch ? (
          <div
            className={`${styles.matchBanner} ${styles.matchSuccess}`}
            data-testid="population-match"
          >
            <span>✓ County population sum matches state record perfectly</span>
          </div>
        ) : (
          <div
            className={`${styles.matchBanner} ${styles.matchMismatch}`}
            data-testid="population-mismatch"
          >
            <span>⚠️ County population sum does not match state total</span>
            <span className={styles.discrepancyBadge} data-testid="discrepancy-badge">
              {difference > 0 ? `+${difference}` : difference} mismatch
            </span>
          </div>
        )}
      </div>

      <div className={styles.countiesSection}>
        <h3 className={styles.countiesTitle}>
          Counties Breakdown ({counties ? counties.length : 0})
        </h3>
        {isLoading ? (
          <div className={styles.loading}>Fetching counties...</div>
        ) : counties ? (
          <CountyList counties={counties} />
        ) : null}
      </div>
    </div>
  );
};
