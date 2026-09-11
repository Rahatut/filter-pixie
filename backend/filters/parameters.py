from dataclasses import asdict, dataclass, fields, replace
from typing import Any


@dataclass(frozen=True)
class FilterParameters:
    """All tunable inputs accepted by the shared filter pipeline."""

    brightness: float = 0.0
    contrast: float = 1.0
    hue: float = 0.0
    saturation: float = 1.0
    value: float = 1.0
    highlights: float = 0.0
    shadows: float = 0.0
    blur: float = 0.0
    grain: float = 0.0
    vignette: float = 0.0
    fade: float = 0.0
    glow: float = 0.0


PARAMETER_LIMITS: dict[str, tuple[float, float]] = {
    "brightness": (-1.0, 1.0),
    "contrast": (0.0, 2.0),
    "hue": (-360.0, 360.0),
    "saturation": (0.0, 2.0),
    "value": (0.0, 2.0),
    "highlights": (-1.0, 1.0),
    "shadows": (-1.0, 1.0),
    "blur": (0.0, 1.0),
    "grain": (0.0, 1.0),
    "vignette": (0.0, 1.0),
    "fade": (0.0, 1.0),
    "glow": (0.0, 1.0),
}


def clamp_parameters(values: dict[str, Any]) -> dict[str, float]:
    valid_names = {field.name for field in fields(FilterParameters)}
    unknown = set(values) - valid_names
    if unknown:
        raise ValueError(f"Unknown filter parameter(s): {', '.join(sorted(unknown))}")

    result = {}
    for name, value in values.items():
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"Parameter '{name}' must be a number")
        lower, upper = PARAMETER_LIMITS[name]
        result[name] = max(lower, min(upper, float(value)))
    return result


def parameters_from(values: dict[str, Any] | None = None) -> FilterParameters:
    return replace(FilterParameters(), **clamp_parameters(values or {}))


def parameter_dict(parameters: FilterParameters) -> dict[str, float]:
    return asdict(parameters)

# customizing filters

PRESETS: dict[str, FilterParameters] = {
    "dreamy": FilterParameters(
        brightness=0.08, contrast=0.90, hue=8.0, saturation=1.15, value=1.08,
        blur=0.20, grain=0.02, vignette=0.08, glow=0.22,
    ),
    "noir": FilterParameters(
        brightness=-0.05, contrast=1.30, saturation=0.0, value=0.95,
        grain=0.15, vignette=0.30,
    ),
    "vintage": FilterParameters(
        brightness=-0.02, contrast=1.08, hue=18.0, saturation=0.82, value=0.98,
        grain=0.12, vignette=0.22, fade=0.12,
    ),
    "sketch": FilterParameters(
        brightness=0.04, contrast=1.18, saturation=0.0,
        blur=0.08,
    ),
}

PRESET_NAMES = {
    "dreamy": "Dreamy",
    "noir": "Noir",
    "vintage": "Vintage",
    "sketch": "Sketch",
}


def preset_parameters(name: str, intensity: float = 1.0, overrides: dict[str, Any] | None = None) -> FilterParameters:
    if name not in PRESETS:
        raise KeyError(name)
    intensity = max(0.0, min(1.0, float(intensity)))
    preset = PRESETS[name]
    values = parameter_dict(preset)
    for field_name, value in values.items():
        neutral = 1.0 if field_name in {"contrast", "saturation", "value"} else 0.0
        values[field_name] = neutral + (value - neutral) * intensity
    values.update(clamp_parameters(overrides or {}))
    return parameters_from(values)