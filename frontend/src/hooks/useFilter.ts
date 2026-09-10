import { useState, useCallback, useRef, useEffect } from 'react';
import { applyFilter } from '../utils/api';
import type { FilterId } from '../types/filters';

interface UseFilterReturn {
  originalImage: string | null;
  filteredImage: string | null;
  isLoading: boolean;
  error: string | null;
  intensity: number;
  selectedFilter: FilterId | null;
  applySelectedFilter: (file: File, filterId: FilterId) => Promise<void>;
  setIntensity: (value: number) => void;
  setSelectedFilter: (filter: FilterId | null) => void;
  reset: () => void;
  downloadImage: () => void;
}

export function useFilter(): UseFilterReturn {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<FilterId | null>(null);
  const originalFileRef = useRef<File | null>(null);

  const reset = useCallback(() => {
    if (originalImage) URL.revokeObjectURL(originalImage);
    if (filteredImage) URL.revokeObjectURL(filteredImage);
    setOriginalImage(null);
    setFilteredImage(null);
    setSelectedFilter(null);
    setError(null);
    originalFileRef.current = null;
  }, [originalImage, filteredImage]);

  const applySelectedFilter = useCallback(
    async (file: File, filterId: FilterId) => {
      setIsLoading(true);
      setError(null);
      setSelectedFilter(filterId);

      if (originalFileRef.current !== file) {
        if (originalImage) URL.revokeObjectURL(originalImage);
        const objectUrl = URL.createObjectURL(file);
        setOriginalImage(objectUrl);
        originalFileRef.current = file;
      }

      try {
        const resultUrl = await applyFilter(file, filterId, intensity);
        if (filteredImage) URL.revokeObjectURL(filteredImage);
        setFilteredImage(resultUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setFilteredImage(null);
      } finally {
        setIsLoading(false);
      }
    },
    [intensity, filteredImage, originalImage]
  );

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
    if (filteredImage && selectedFilter && originalFileRef.current) {
      applySelectedFilter(originalFileRef.current, selectedFilter);
    }
  }, [intensity, selectedFilter]);

  return {
    originalImage,
    filteredImage,
    isLoading,
    error,
    intensity,
    selectedFilter,
    applySelectedFilter,
    setIntensity,
    setSelectedFilter,
    reset,
    downloadImage,
  };
}