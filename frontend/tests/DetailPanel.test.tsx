import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DetailPanel } from '../src/components/DetailPanel/DetailPanel';
import { State, County } from '../src/types';

describe('DetailPanel Component', () => {
  it('renders informative placeholder when no state is selected', () => {
    render(
      <DetailPanel
        selectedState={null}
        counties={null}
        isLoading={false}
      />
    );
    expect(
      screen.getByText(/Select a state from either list to view details/i)
    ).toBeInTheDocument();
  });

  it('renders state details and match indicator when population sums match', () => {
    const mockState: State = {
      id: 1,
      state: 'TestState',
      population: 1000,
      counties: 2,
      detail: '/state/TestState',
    };

    const mockCounties: County[] = [
      { county: 'County A', population: 600 },
      { county: 'County B', population: 400 },
    ];

    render(
      <DetailPanel
        selectedState={mockState}
        counties={mockCounties}
        isLoading={false}
      />
    );

    expect(screen.getByText('TestState')).toBeInTheDocument();
    expect(screen.getByTestId('population-match')).toBeInTheDocument();
    expect(
      screen.getByText(/County population sum matches state record perfectly/i)
    ).toBeInTheDocument();
  });

  it('renders mismatch indicator and exact discrepancy badge for Iowa (+1 discrepancy)', () => {
    const iowaState: State = {
      id: 14,
      state: 'Iowa',
      population: 3090415,
      counties: 2,
      detail: '/state/Iowa',
    };

    const iowaCounties: County[] = [
      { county: 'County A', population: 2000000 },
      { county: 'County B', population: 1090416 }, // Sum = 3090416 (diff +1)
    ];

    render(
      <DetailPanel
        selectedState={iowaState}
        counties={iowaCounties}
        isLoading={false}
      />
    );

    expect(screen.getByText('Iowa')).toBeInTheDocument();
    expect(screen.getByTestId('population-mismatch')).toBeInTheDocument();
    const badge = screen.getByTestId('discrepancy-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('+1 mismatch');
  });
});
