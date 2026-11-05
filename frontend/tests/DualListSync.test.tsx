import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../src/App';
import * as statesApi from '../src/api/statesApi';
import { State, County } from '../src/types';

const mockStates: State[] = [
  { id: 1, state: 'Alabama', population: 4833722, counties: 67, detail: '/state/Alabama' },
  { id: 2, state: 'Alaska', population: 735132, counties: 29, detail: '/state/Alaska' },
  { id: 3, state: 'Texas', population: 26448193, counties: 254, detail: '/state/Texas' },
];

const mockAlabamaCounties: County[] = [
  { county: 'Autauga County', population: 55246 },
  { county: 'Baldwin County', population: 195540 },
];

describe('Dual List Synchronization & Highlighting', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(statesApi, 'fetchStates').mockResolvedValue(mockStates);
    vi.spyOn(statesApi, 'fetchStateCounties').mockResolvedValue(mockAlabamaCounties);
  });

  it('renders both List #1 and List #2 with all states', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('state-list-1')).toBeInTheDocument();
      expect(screen.getByTestId('state-list-2')).toBeInTheDocument();
    });

    const list1 = screen.getByTestId('state-list-1');
    const list2 = screen.getByTestId('state-list-2');

    expect(list1).toHaveTextContent('Alabama');
    expect(list2).toHaveTextContent('Alabama');
  });

  it('toggles highlight status across both lists on double-click in List #1', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('state-list-1')).toBeInTheDocument();
    });

    const list1 = screen.getByTestId('state-list-1');
    const list2 = screen.getByTestId('state-list-2');

    const alabamaInList1 = list1.querySelector('[data-testid="state-item-Alabama"]')!;
    const alabamaInList2 = list2.querySelector('[data-testid="state-item-Alabama"]')!;

    // Initial state: not highlighted
    expect(alabamaInList1.className).not.toMatch(/highlighted/);
    expect(alabamaInList2.className).not.toMatch(/highlighted/);

    // Double-click in List #1
    fireEvent.doubleClick(alabamaInList1);

    // Both should now be highlighted
    expect(alabamaInList1.className).toMatch(/highlighted/);
    expect(alabamaInList2.className).toMatch(/highlighted/);

    // Double-click in List #2 to unhighlight
    fireEvent.doubleClick(alabamaInList2);

    // Both should now be unhighlighted
    expect(alabamaInList1.className).not.toMatch(/highlighted/);
    expect(alabamaInList2.className).not.toMatch(/highlighted/);
  });

  it('loads details when single-clicking in List #2', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('state-list-2')).toBeInTheDocument();
    });

    const list2 = screen.getByTestId('state-list-2');
    const alabamaInList2 = list2.querySelector('[data-testid="state-item-Alabama"]')!;

    fireEvent.click(alabamaInList2);

    await waitFor(() => {
      const detailPanel = screen.getByTestId('detail-panel');
      expect(detailPanel).toHaveTextContent('Alabama');
      expect(detailPanel).toHaveTextContent('Autauga County');
    });
  });
});
