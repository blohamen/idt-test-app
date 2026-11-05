import React from 'react';
import { State } from '../../types';
import { StateItem } from '../StateItem/StateItem';
import styles from './StateList.module.css';

interface StateListProps {
  title: string;
  states: State[];
  selectedStateName: string | null;
  highlightedStateNames: Set<string>;
  onSelectState: (state: State) => void;
  onToggleHighlight: (state: State) => void;
  emptyMessage?: string;
  testId?: string;
}

export const StateList: React.FC<StateListProps> = ({
  title,
  states,
  selectedStateName,
  highlightedStateNames,
  onSelectState,
  onToggleHighlight,
  emptyMessage = 'No states to display',
  testId = 'state-list',
}) => {
  return (
    <div className={styles.container} data-testid={testId}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.counter}>{states.length} states</span>
      </div>
      <div className={styles.scrollArea} role="list">
        {states.length === 0 ? (
          <div className={styles.emptyState}>{emptyMessage}</div>
        ) : (
          states.map((state) => (
            <StateItem
              key={state.state}
              state={state}
              isSelected={selectedStateName === state.state}
              isHighlighted={highlightedStateNames.has(state.state)}
              onSelect={onSelectState}
              onToggleHighlight={onToggleHighlight}
            />
          ))
        )}
      </div>
    </div>
  );
};
