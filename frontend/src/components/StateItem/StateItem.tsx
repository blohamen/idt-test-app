import React from 'react';
import { State } from '../../types';
import styles from './StateItem.module.css';

interface StateItemProps {
  state: State;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (state: State) => void;
  onToggleHighlight: (state: State) => void;
}

export const StateItem: React.FC<StateItemProps> = ({
  state,
  isSelected,
  isHighlighted,
  onSelect,
  onToggleHighlight,
}) => {
  const itemClasses = [
    styles.item,
    isSelected ? styles.selected : '',
    isHighlighted ? styles.highlighted : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    onSelect(state);
  };

  const handleDoubleClick = () => {
    onToggleHighlight(state);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSelect(state);
    } else if (e.key === ' ') {
      e.preventDefault();
      onToggleHighlight(state);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-pressed={isHighlighted}
      data-testid={`state-item-${state.state}`}
      className={itemClasses}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      title="Press Enter or click to view details; press Space or double-click to toggle highlight"
    >
      <span className={styles.name}>{state.state}</span>
      <span className={styles.badge}>{state.counties} counties</span>
    </div>
  );
};
