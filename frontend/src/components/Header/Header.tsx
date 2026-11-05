import React from 'react';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  return (
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
  );
};
