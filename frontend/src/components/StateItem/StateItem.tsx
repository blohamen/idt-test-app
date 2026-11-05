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

  return (
    <div
      role="listitem"
      data-testid={`state-item-${state.state}`}
      className={itemClasses}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title="Single-click to view details, double-click to toggle highlight"
    >
      <span className={styles.name}>{state.state}</span>
      <span className={styles.badge}>{state.counties} counties</span>
    </div>
  );
};
