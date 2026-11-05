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

export interface PopulationSummary {
  statePopulation: number;
  countySum: number;
  difference: number;
  isMatch: boolean;
}
