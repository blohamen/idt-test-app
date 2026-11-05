import { State, County } from '../types';

export async function fetchStates(): Promise<State[]> {
  const response = await fetch('/states');
  if (!response.ok) {
    throw new Error(`Failed to load states: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function fetchStateCounties(detailUrl: string): Promise<County[]> {
  const response = await fetch(detailUrl);
  if (!response.ok) {
    throw new Error(`Failed to load state details: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
