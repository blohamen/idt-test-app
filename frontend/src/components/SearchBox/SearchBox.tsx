import React from 'react';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  query: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  query,
  onChange,
  placeholder = 'Search states (List #2 only)...',
}) => {
  return (
    <div className={styles.container}>
      <input
        type="text"
        data-testid="search-input"
        className={styles.input}
        value={query}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter second state list"
      />
      {query && (
        <button
          type="button"
          data-testid="clear-search-button"
          className={styles.clearButton}
          onClick={() => onChange('')}
          aria-label="Clear search query"
        >
          ✕
        </button>
      )}
    </div>
  );
};
