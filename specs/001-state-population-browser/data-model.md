# Data Model: State Population Browser

## 1. Relational Schema (PostgreSQL)

```sql
CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    population INT NOT NULL,
    county_count INT NOT NULL,
    detail_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS counties (
    id SERIAL PRIMARY KEY,
    state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    population INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counties_state_id ON counties(state_id);
```

## 2. Integrity Rules & Invariants

1. **State Name Uniqueness**: Every state has a unique name matching the source mock directory (`mock/states/<StateName>.json`).
2. **Cascading Deletion**: Removing a state removes its associated counties.
3. **Data Counts**:
   - Total states: `51` (including "District of Columbia").
   - Total counties: `3,143`.
4. **Discrepancy Invariant**:
   - Iowa recorded population: `3,090,415`.
   - Iowa county population sum: `3,090,416` (discrepancy of `+1`).
   - The database stores exact source data without alteration.

## 3. TypeScript Interfaces

```typescript
export interface State {
  id: number;
  state: string;
  population: number;
  counties: number;
  detail: string;
}

export interface County {
  county: string;
  population: number;
}

export interface PopulationComparison {
  statePopulation: number;
  countySum: number;
  difference: number;
  isMatch: boolean;
}
```
