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

    await waitFor(() => {
      expect(screen.getByTestId('detail-panel')).toHaveTextContent('Alabama');
    });

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

  it('prevents duplicate fetch calls when double-clicking a state', async () => {
    const fetchSpy = vi.spyOn(statesApi, 'fetchStateCounties');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('state-list-1')).toBeInTheDocument();
    });

    const list1 = screen.getByTestId('state-list-1');
    const alabamaItem = list1.querySelector('[data-testid="state-item-Alabama"]')!;

    // Simulate browser double-click sequence: click, click, dblclick
    fireEvent.click(alabamaItem);
    fireEvent.click(alabamaItem);
    fireEvent.doubleClick(alabamaItem);

    await waitFor(() => {
      expect(screen.getByTestId('detail-panel')).toHaveTextContent('Alabama');
    });

    // Despite 2 clicks and 1 dblclick, fetch MUST be called only once
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('prevents redundant fetch calls when clicking an already selected state', async () => {
    const fetchSpy = vi.spyOn(statesApi, 'fetchStateCounties');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('state-list-1')).toBeInTheDocument();
    });

    const list1 = screen.getByTestId('state-list-1');
    const alabamaItem = list1.querySelector('[data-testid="state-item-Alabama"]')!;

    // First click: loads data
    fireEvent.click(alabamaItem);

    await waitFor(() => {
      expect(screen.getByTestId('detail-panel')).toHaveTextContent('Alabama');
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Subsequent clicks on already selected state
    fireEvent.click(alabamaItem);
    fireEvent.click(alabamaItem);

    // Must not trigger additional network calls
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('handles race conditions by showing only the latest requested state details', async () => {
    const mockAlaskaCounties: County[] = [{ county: 'Anchorage Municipality', population: 298695 }];

    // Alabama takes 80ms, Alaska takes 10ms
    vi.spyOn(statesApi, 'fetchStateCounties').mockImplementation(async (url: string) => {
      if (url.includes('Alabama')) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return mockAlabamaCounties;
      }
      if (url.includes('Alaska')) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return mockAlaskaCounties;
      }
      return [];
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('state-list-1')).toBeInTheDocument();
    });

    const list1 = screen.getByTestId('state-list-1');
    const alabamaItem = list1.querySelector('[data-testid="state-item-Alabama"]')!;
    const alaskaItem = list1.querySelector('[data-testid="state-item-Alaska"]')!;

    // Trigger Alabama first, then immediately Alaska
    fireEvent.click(alabamaItem);
    fireEvent.click(alaskaItem);

    // Wait until detail panel updates
    await waitFor(() => {
      const detail = screen.getByTestId('detail-panel');
      expect(detail).toHaveTextContent('Alaska');
      expect(detail).toHaveTextContent('Anchorage Municipality');
    });

    // Wait past Alabama's delayed resolution
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Alabama's slower resolution must NOT overwrite Alaska's panel
    const detail = screen.getByTestId('detail-panel');
    expect(detail).toHaveTextContent('Alaska');
    expect(detail).not.toHaveTextContent('Alabama');
    expect(detail).not.toHaveTextContent('Autauga County');
  });

  it('clears previous state data when a subsequent state load fails', async () => {
    vi.spyOn(statesApi, 'fetchStateCounties').mockImplementation(async (url: string) => {
      if (url.includes('Alabama')) {
        return mockAlabamaCounties;
      }
      throw new Error('Network error');
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('state-list-1')).toBeInTheDocument();
    });

    const list1 = screen.getByTestId('state-list-1');
    const alabamaItem = list1.querySelector('[data-testid="state-item-Alabama"]')!;
    const alaskaItem = list1.querySelector('[data-testid="state-item-Alaska"]')!;

    // First load Alabama successfully
    fireEvent.click(alabamaItem);

    await waitFor(() => {
      expect(screen.getByTestId('detail-panel')).toHaveTextContent('Autauga County');
    });

    // Now click Alaska which triggers an error
    fireEvent.click(alaskaItem);

    await waitFor(() => {
      const detail = screen.getByTestId('detail-panel');
      // Previous Alabama data must be cleared
      expect(detail).not.toHaveTextContent('Autauga County');
      expect(detail).toHaveTextContent('Could not load county details for Alaska');
    });
  });

  it('supports keyboard navigation with Enter to select and Space to toggle highlight', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('state-list-1')).toBeInTheDocument();
    });

    const list1 = screen.getByTestId('state-list-1');
    const alabamaItem = list1.querySelector('[data-testid="state-item-Alabama"]')!;

    // Initial state: not highlighted
    expect(alabamaItem.className).not.toMatch(/highlighted/);

    // Press Space: should toggle highlight
    fireEvent.keyDown(alabamaItem, { key: ' ' });
    expect(alabamaItem.className).toMatch(/highlighted/);

    // Press Enter: should select state and load details
    fireEvent.keyDown(alabamaItem, { key: 'Enter' });

    await waitFor(() => {
      const detail = screen.getByTestId('detail-panel');
      expect(detail).toHaveTextContent('Alabama');
      expect(detail).toHaveTextContent('Autauga County');
    });
  });
});
