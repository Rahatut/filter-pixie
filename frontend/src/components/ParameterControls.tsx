import type { FilterParameters } from '../types/filters';

interface ParameterDefinition {
  id: keyof FilterParameters;
  name: string;
  min: number;
  max: number;
  step: number;
}

const GROUPS: { name: string; parameters: ParameterDefinition[] }[] = [
  {
    name: 'Exposure & tone',
    parameters: [
      { id: 'brightness', name: 'Brightness', min: -1, max: 1, step: 0.01 },
      { id: 'contrast', name: 'Contrast', min: 0, max: 2, step: 0.01 },
      { id: 'highlights', name: 'Highlights', min: -1, max: 1, step: 0.01 },
      { id: 'shadows', name: 'Shadows', min: -1, max: 1, step: 0.01 },
    ],
  },
  {
    name: 'Color',
    parameters: [
      { id: 'hue', name: 'Hue', min: -360, max: 360, step: 1 },
      { id: 'saturation', name: 'Saturation', min: 0, max: 2, step: 0.01 },
      { id: 'value', name: 'Value', min: 0, max: 2, step: 0.01 },
    ],
  },
  {
    name: 'Detail & texture',
    parameters: [
      { id: 'blur', name: 'Blur', min: 0, max: 1, step: 0.01 },
      { id: 'grain', name: 'Grain', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    name: 'Optical effects',
    parameters: [
      { id: 'vignette', name: 'Vignette', min: 0, max: 1, step: 0.01 },
      { id: 'fade', name: 'Fade', min: 0, max: 1, step: 0.01 },
      { id: 'glow', name: 'Glow', min: 0, max: 1, step: 0.01 },
    ],
  },
];

interface ParameterControlsProps {
  values: FilterParameters;
  onChange: (id: keyof FilterParameters, value: number) => void;
  onColorPick: (values: Pick<FilterParameters, 'hue' | 'saturation' | 'value'>) => void;
  disabled?: boolean;
}

function hsvToHex(hue: number, saturation: number, value: number): string {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const normalizedSaturation = Math.min(1, saturation / 2);
  const normalizedValue = Math.min(1, value / 2);
  const chroma = normalizedValue * normalizedSaturation;
  const segment = normalizedHue / 60;
  const second = chroma * (1 - Math.abs((segment % 2) - 1));
  const match = normalizedValue - chroma;
  const channels = segment < 1 ? [chroma, second, 0] : segment < 2 ? [second, chroma, 0] : segment < 3 ? [0, chroma, second] : segment < 4 ? [0, second, chroma] : segment < 5 ? [second, 0, chroma] : [chroma, 0, second];
  return `#${channels.map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0')).join('')}`;
}

function hexToHsv(hex: string): Pick<FilterParameters, 'hue' | 'saturation' | 'value'> {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const delta = maximum - minimum;
  let hue = 0;

  if (delta) {
    if (maximum === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (maximum === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }

  return {
    hue: hue < 0 ? hue + 360 : hue,
    saturation: maximum ? (delta / maximum) * 2 : 0,
    value: maximum * 2,
  };
}

export function ParameterControls({ values, onChange, onColorPick, disabled }: ParameterControlsProps) {
  const colorValue = hsvToHex(values.hue, values.saturation, values.value);

  return (
    <div className="parameter-controls">
      {GROUPS.map((group) => (
        <section className="parameter-group" key={group.name}>
          <h3>{group.name}</h3>
          {group.name === 'Color' && (
            <label className="color-picker-row">
              <span>Choose a color</span>
              <input
                type="color"
                value={colorValue}
                onChange={(event) => onColorPick(hexToHsv(event.target.value))}
                disabled={disabled}
                aria-label="Choose a custom color"
              />
            </label>
          )}
          {group.parameters.map((parameter) => (
            <label className="parameter-row" key={parameter.id}>
              <span>{parameter.name}</span>
              <output>{values[parameter.id].toFixed(2)}</output>
              <input
                type="range"
                min={parameter.min}
                max={parameter.max}
                step={parameter.step}
                value={values[parameter.id]}
                onChange={(event) => onChange(parameter.id, Number(event.target.value))}
                disabled={disabled}
                aria-label={parameter.name}
              />
            </label>
          ))}
        </section>
      ))}
    </div>
  );
}