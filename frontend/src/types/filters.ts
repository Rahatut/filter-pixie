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
];

export type FilterId = FilterOption['id'];

export interface FilterParameters {
  brightness: number;
  contrast: number;
  hue: number;
  saturation: number;
  value: number;
  highlights: number;
  shadows: number;
  blur: number;
  grain: number;
  vignette: number;
  fade: number;
  glow: number;
}

export const DEFAULT_PARAMETERS: FilterParameters = {
  brightness: 0,
  contrast: 1,
  hue: 0,
  saturation: 1,
  value: 1,
  highlights: 0,
  shadows: 0,
  blur: 0,
  grain: 0,
  vignette: 0,
  fade: 0,
  glow: 0,
};

export const PRESET_PARAMETERS: Record<FilterId, FilterParameters> = {
  dreamy: { ...DEFAULT_PARAMETERS, brightness: 0.08, contrast: 0.9, hue: 8, saturation: 1.15, value: 1.08, blur: 0.2, grain: 0.02, vignette: 0.08, glow: 0.22 },
  noir: { ...DEFAULT_PARAMETERS, brightness: -0.05, contrast: 1.3, saturation: 0, value: 0.95, grain: 0.15, vignette: 0.3 },
  vintage: { ...DEFAULT_PARAMETERS, contrast: 1.08, hue: 18, saturation: 0.82, value: 0.98, grain: 0.12, vignette: 0.22, fade: 0.12 },
  sketch: { ...DEFAULT_PARAMETERS, brightness: 0.04, contrast: 1.18, saturation: 0, blur: 0.08 },
};