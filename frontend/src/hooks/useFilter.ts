import { useState, useCallback, useRef, useEffect } from 'react';
import { applyFilter } from '../utils/api';
import { DEFAULT_PARAMETERS, PRESET_PARAMETERS, type FilterId, type FilterParameters } from '../types/filters';

interface UseFilterReturn {
  originalImage: string | null;
  filteredImage: string | null;
  isLoading: boolean;
  error: string | null;
  parameters: FilterParameters;
  selectedFilter: FilterId | null;
  polaroid: boolean;
  applySelectedFilter: (file: File, filterId: FilterId) => Promise<void>;
  setParameter: (id: keyof FilterParameters, value: number) => void;
  setPolaroid: (enabled: boolean) => void;
  setSelectedFilter: (filter: FilterId | null) => void;
  reset: () => void;
  downloadImage: () => void;
}

export function useFilter(): UseFilterReturn {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parameters, setParameters] = useState<FilterParameters>({ ...DEFAULT_PARAMETERS });
  const [selectedFilter, setSelectedFilterState] = useState<FilterId | null>(null);
  const [polaroid, setPolaroid] = useState(false);
  const originalFileRef = useRef<File | null>(null);
  const originalImageRef = useRef<string | null>(null);
  const filteredImageRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const appliedSettingsRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    if (originalImageRef.current) URL.revokeObjectURL(originalImageRef.current);
    if (filteredImageRef.current) URL.revokeObjectURL(filteredImageRef.current);
    setOriginalImage(null);
    setFilteredImage(null);
    setSelectedFilterState(null);
    setPolaroid(false);
    setError(null);
    originalFileRef.current = null;
    originalImageRef.current = null;
    filteredImageRef.current = null;
    appliedSettingsRef.current = null;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, [originalImage, filteredImage]);

  const applySelectedFilter = useCallback(
    async (file: File, filterId: FilterId) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);
      setSelectedFilterState(filterId);

      if (originalFileRef.current !== file) {
        if (originalImageRef.current) URL.revokeObjectURL(originalImageRef.current);
        const objectUrl = URL.createObjectURL(file);
        originalImageRef.current = objectUrl;
        setOriginalImage(objectUrl);
        originalFileRef.current = file;
      }

      try {
        const resultUrl = await applyFilter(file, filterId, 1, parameters, polaroid, controller.signal);
        if (abortControllerRef.current !== controller) {
          URL.revokeObjectURL(resultUrl);
          return;
        }
        if (filteredImageRef.current) URL.revokeObjectURL(filteredImageRef.current);
        filteredImageRef.current = resultUrl;
        setFilteredImage(resultUrl);
      } catch (err) {
        if (abortControllerRef.current !== controller) return;
        appliedSettingsRef.current = null;
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setFilteredImage(null);
      } finally {
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }
    },
    [parameters, polaroid]
  );

  const setParameter = useCallback((id: keyof FilterParameters, value: number) => {
    setParameters((current) => ({ ...current, [id]: value }));
  }, []);

  const setSelectedFilter = useCallback((filter: FilterId | null) => {
    setSelectedFilterState(filter);
    if (filter) setParameters({ ...PRESET_PARAMETERS[filter] });
  }, []);

  const downloadImage = useCallback(() => {
    if (!filteredImage) return;
    const a = document.createElement('a');
    a.href = filteredImage;
    a.download = `filterpixie-${selectedFilter || 'filtered'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [filteredImage, selectedFilter]);

  useEffect(() => {
    if (!filteredImage || !selectedFilter || !originalFileRef.current) return;

    const settingsKey = JSON.stringify([selectedFilter, parameters, polaroid]);
    if (appliedSettingsRef.current === settingsKey) return;
    appliedSettingsRef.current = settingsKey;

    applySelectedFilter(originalFileRef.current, selectedFilter);
  }, [selectedFilter, parameters, polaroid, applySelectedFilter]);

  return {
    originalImage,
    filteredImage,
    isLoading,
    error,
    selectedFilter,
    polaroid,
    applySelectedFilter,
    parameters,
    setParameter,
    setPolaroid,
    setSelectedFilter,
    reset,
    downloadImage,
  };
}