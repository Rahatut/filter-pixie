import { useRef, ChangeEvent } from 'react';
import { useDragDrop } from '../hooks/useDragDrop';

interface DropZoneProps {
  onImageSelect: (file: File) => void;
  hasImage: boolean;
  isLoading: boolean;
}

export function DropZone({ onImageSelect, hasImage, isLoading }: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDragActive, onDragEnter, onDragLeave, onDragOver, onDrop, onFileSelect } =
    useDragDrop((file) => {
      onImageSelect(file);
    });

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (hasImage) {
    return null;
  }

  return (
    <div
      className="drop-zone"
      onClick={handleClick}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="Upload image"
      data-drag-active={isDragActive}
      data-loading={isLoading}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
        id="image-upload"
        disabled={isLoading}
      />
      <label htmlFor="image-upload" className="drop-zone-label">
        <svg className="drop-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="drop-zone-text">
          <span className="drop-zone-main">Drop your photo here</span>
          <span className="drop-zone-sub">or click to browse</span>
        </p>
        <span className="drop-zone-hint">PNG, JPG, WebP · Max 10MB</span>
      </label>
      {isLoading && (
        <div className="drop-zone-loading" aria-live="polite">
          <div className="spinner" />
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}