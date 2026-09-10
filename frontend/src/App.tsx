import { useState, useCallback } from 'react';
import { useFilter } from './hooks/useFilter';
import { DropZone } from './components/DropZone';
import { FilterButtons } from './components/FilterButtons';
import { IntensitySlider } from './components/IntensitySlider';
import { DownloadButton } from './components/DownloadButton';
import { ErrorMessage } from './components/ErrorMessage';
import type { FilterId } from './types/filters';

function App() {
  const [error, setError] = useState<string | null>(null);

  const {
    originalImage,
    filteredImage,
    isLoading,
    error: filterError,
    intensity,
    selectedFilter,
    applySelectedFilter,
    setIntensity,
    setSelectedFilter,
    reset,
    downloadImage,
  } = useFilter();

  const handleImageSelect = useCallback(
    (file: File) => {
      setError(null);
      applySelectedFilter(file, selectedFilter || 'dreamy');
      setSelectedFilter(selectedFilter || 'dreamy');
    },
    [applySelectedFilter, selectedFilter, setSelectedFilter]
  );

  const handleFilterSelect = useCallback(
    (filterId: FilterId) => {
      if (originalImage) {
        setSelectedFilter(filterId);
      }
    },
    [originalImage, setSelectedFilter]
  );

  if (filterError) {
    setError(filterError);
  }

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <p className="app-kicker">PHOTO STUDIO</p>
          <h1 className="app-title">filterpixie</h1>
        </div>
        <p className="app-subtitle">Shape the mood of your image</p>
      </header>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <section className="app-main" aria-label="Main content">
        {!originalImage ? (
          <DropZone onImageSelect={handleImageSelect} hasImage={false} isLoading={isLoading} />
        ) : (
          <div className="editor">
            <div className="editor-preview">
              <div className="preview-toolbar">
                <span className="preview-label">Edited preview</span>
                <span className="preview-format">{selectedFilter || 'Original'} / 4:3</span>
              </div>
              <div className="preview-single">
                <img
                  src={filteredImage || originalImage}
                  alt={filteredImage ? `${selectedFilter} filtered` : 'Original image'}
                  className="preview-image"
                />
              </div>
            </div>

            <div className="editor-controls">
              <div className="controls-heading">
                <div>
                  <p className="section-kicker">EDIT YOUR PHOTO</p>
                  <h2>Choose a look</h2>
                </div>
                <span className="editor-status">{isLoading ? 'Applying' : 'Ready'}</span>
              </div>
              <FilterButtons
                selectedFilter={selectedFilter}
                onSelectFilter={handleFilterSelect}
                disabled={isLoading}
              />

              <IntensitySlider value={intensity} onChange={setIntensity} disabled={isLoading} />

              <DownloadButton onDownload={downloadImage} disabled={isLoading || !filteredImage} />
            </div>
          </div>
        )}
      </section>

      <footer className="app-footer">
        <p>Made with OpenCV + FastAPI + React</p>
      </footer>

      <button
        className="reset-btn"
        onClick={() => {
          reset();
          setError(null);
        }}
        disabled={!originalImage}
        aria-label="Start over"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M21 12a9 9 0 1 1-9 9 9.75 9.75 0 0 1 6.74-2.74L21 16" />
        </svg>
        <span>New Photo</span>
      </button>
    </main>
  );
}

export default App;