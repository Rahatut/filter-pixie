import { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react';

interface BeforeAfterSliderProps {
  beforeSrc: string | null;
  afterSrc: string | null;
  alt?: string;
}

export function BeforeAfterSlider({ beforeSrc, afterSrc, alt = 'Filtered image' }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(newPosition);
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMove = (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };

    const handleUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  if (!beforeSrc || !afterSrc) return null;

  return (
    <div
      className="before-after-slider"
      ref={containerRef}
      role="img"
      aria-label={`Before/after comparison for ${alt}`}
    >
      <div className="slider-image before" style={{ width: `${position}%` }}>
        <img src={beforeSrc} alt={`Original ${alt}`} />
      </div>
      <div className="slider-image after" style={{ width: `${100 - position}%` }}>
        <img src={afterSrc} alt={`Filtered ${alt}`} />
      </div>
      <div
        className="slider-handle"
        style={{ left: `${position}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-label="Compare before and after"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        tabIndex={0}
        onKeyDown={(e) => {
          const step = 5;
          if (e.key === 'ArrowLeft') {
            setPosition((p) => Math.max(0, p - step));
          } else if (e.key === 'ArrowRight') {
            setPosition((p) => Math.min(100, p + step));
          }
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      <div className="slider-labels">
        <span className="slider-label before">Original</span>
        <span className="slider-label after">Filtered</span>
      </div>
    </div>
  );
}