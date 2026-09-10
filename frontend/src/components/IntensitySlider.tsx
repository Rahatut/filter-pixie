interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function IntensitySlider({ value, onChange, disabled }: IntensitySliderProps) {
  return (
    <div className="intensity-slider">
      <label htmlFor="intensity" className="intensity-label">
        Intensity
        <span className="intensity-value">{Math.round(value * 100)}%</span>
      </label>
      <input
        id="intensity"
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="intensity-input"
        aria-label="Filter intensity"
      />
    </div>
  );
}