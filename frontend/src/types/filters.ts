export interface Filter {
  id: string;
  name: string;
}

export interface FilterOption {
  id: string;
  name: string;
  preview?: string;
}

export const FILTERS: FilterOption[] = [
  { id: 'dreamy', name: 'Dreamy' },
  { id: 'noir', name: 'Noir' },
  { id: 'vintage', name: 'Vintage' },
  { id: 'sketch', name: 'Sketch' },
  { id: 'neon', name: 'Neon' },
];

export type FilterId = FilterOption['id'];