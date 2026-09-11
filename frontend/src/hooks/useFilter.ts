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
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (originalImage) URL.revokeObjectURL(originalImage);
    if (filteredImage) URL.revokeObjectURL(filteredImage);
    setOriginalImage(null);
    setFilteredImage(null);
    setSelectedFilterState(null);
    setPolaroid(false);
    setError(null);
    originalFileRef.current = null;
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
        if (originalImage) URL.revokeObjectURL(originalImage);
        const objectUrl = URL.createObjectURL(file);
        setOriginalImage(objectUrl);
        originalFileRef.current = file;
      }

      try {
        const resultUrl = await applyFilter(file, filterId, 1, parameters, polaroid, controller.signal);
        if (filteredImage) URL.revokeObjectURL(filteredImage);
        setFilteredImage(resultUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setFilteredImage(null);
      } finally {
        setIsLoading(false);
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [parameters, polaroid, filteredImage, originalImage]
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
    if (filteredImage && selectedFilter && originalFileRef.current && !isLoading) {
      applySelectedFilter(originalFileRef.current, selectedFilter);
    }
  }, [selectedFilter, parameters, polaroid, isLoading, applySelectedFilter]);

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