import React from 'react';
import { County } from '../../types';
import styles from './CountyList.module.css';

interface CountyListProps {
  counties: County[];
}

export const CountyList: React.FC<CountyListProps> = ({ counties }) => {
  return (
    <div className={styles.container} data-testid="county-list">
      <div className={styles.scrollArea}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>County</th>
              <th className={styles.populationCol}>Population</th>
            </tr>
          </thead>
          <tbody>
            {counties.map((c) => (
              <tr key={c.county}>
                <td>{c.county}</td>
                <td className={styles.populationCol}>
                  {c.population.toLocaleString('en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
