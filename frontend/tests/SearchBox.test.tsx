import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../src/App';
import * as statesApi from '../src/api/statesApi';
import { State } from '../src/types';

const mockStates: State[] = [
  { id: 1, state: 'Maine', population: 1328302, counties: 16, detail: '/state/Maine' },
  { id: 2, state: 'Nevada', population: 2790136, counties: 17, detail: '/state/Nevada' },
  { id: 3, state: 'California', population: 38332521, counties: 58, detail: '/state/California' },
  { id: 4, state: 'Texas', population: 26448193, counties: 254, detail: '/state/Texas' },
];

describe('SearchBox Component & List #2 Filtering', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(statesApi, 'fetchStates').mockResolvedValue(mockStates);
    vi.spyOn(statesApi, 'fetchStateCounties').mockResolvedValue([]);
  });

  it('filters only List #2 based on case-insensitive substring search', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('state-list-1')).toBeInTheDocument();
      expect(screen.getByTestId('state-list-2')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    const list1 = screen.getByTestId('state-list-1');
    const list2 = screen.getByTestId('state-list-2');

    // Initially both have all 4 states
    expect(list1).toHaveTextContent('California');
    expect(list2).toHaveTextContent('California');

    // Type "ne" (should match Maine and Nevada)
    fireEvent.change(searchInput, { target: { value: 'ne' } });

    // List #2 should only have Maine and Nevada
    expect(list2).toHaveTextContent('Maine');
    expect(list2).toHaveTextContent('Nevada');
    expect(list2).not.toHaveTextContent('California');
    expect(list2).not.toHaveTextContent('Texas');

    // List #1 MUST remain completely unfiltered
    expect(list1).toHaveTextContent('Maine');
    expect(list1).toHaveTextContent('Nevada');
    expect(list1).toHaveTextContent('California');
    expect(list1).toHaveTextContent('Texas');
  });

  it('restores all states in List #2 when clearing the search input', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    const list2 = screen.getByTestId('state-list-2');

    fireEvent.change(searchInput, { target: { value: 'cal' } });
    expect(list2).toHaveTextContent('California');
    expect(list2).not.toHaveTextContent('Texas');

    const clearButton = screen.getByTestId('clear-search-button');
    fireEvent.click(clearButton);

    expect(list2).toHaveTextContent('California');
    expect(list2).toHaveTextContent('Texas');
    expect(list2).toHaveTextContent('Maine');
    expect(list2).toHaveTextContent('Nevada');
  });

  it('displays empty message when search yields no matches', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'xyz123' } });

    const list2 = screen.getByTestId('state-list-2');
    expect(list2).toHaveTextContent('No states matching "xyz123"');
  });
});
