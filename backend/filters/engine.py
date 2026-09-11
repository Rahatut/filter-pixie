import cv2
import numpy as np

from .parameters import FilterParameters


class FilterEngine:
    """Applies a consistent, ordered set of parameterized image operations."""

    def apply(self, image: np.ndarray, parameters: FilterParameters) -> np.ndarray:
        result = image.astype(np.float32) / 255.0
        result = self._exposure(result, parameters)
        result = self._color(result, parameters)
        result = self._tone(result, parameters)
        result = self._texture(result, parameters)
        result = self._optical(result, parameters)
        return np.rint(np.clip(result, 0.0, 1.0) * 255.0).astype(np.uint8)

    @staticmethod
    def _exposure(image: np.ndarray, p: FilterParameters) -> np.ndarray:
        return np.clip(image + p.brightness, 0.0, 1.0)

    @staticmethod
    def _color(image: np.ndarray, p: FilterParameters) -> np.ndarray:
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        hsv[:, :, 0] = (hsv[:, :, 0] + p.hue) % 360.0
        hsv[:, :, 1] = np.clip(hsv[:, :, 1] * p.saturation, 0.0, 1.0)
        hsv[:, :, 2] = np.clip(hsv[:, :, 2] * p.value, 0.0, 1.0)
        return np.clip(cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR), 0.0, 1.0)

    @staticmethod
    def _tone(image: np.ndarray, p: FilterParameters) -> np.ndarray:
        result = (image - 0.5) * p.contrast + 0.5
        luminance = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
        highlight_mask = np.clip((luminance - 0.5) * 2.0, 0.0, 1.0)[:, :, None]
        shadow_mask = np.clip((0.5 - luminance) * 2.0, 0.0, 1.0)[:, :, None]
        result += highlight_mask * p.highlights * 0.25 + shadow_mask * p.shadows * 0.25
        return np.clip(result, 0.0, 1.0)

    @staticmethod
    def _texture(image: np.ndarray, p: FilterParameters) -> np.ndarray:
        result = image
        if p.blur:
            sigma = 0.5 + p.blur * 8.0
            result = cv2.GaussianBlur(result, (0, 0), sigma)
        if p.grain:
            noise = np.random.default_rng().normal(0.0, p.grain * 0.08, result.shape[:2] + (1,))
            result = result + noise
        return np.clip(result, 0.0, 1.0)

    @staticmethod
    def _optical(image: np.ndarray, p: FilterParameters) -> np.ndarray:
        result = image

        if p.glow:
            luminance = cv2.cvtColor(result.astype(np.float32), cv2.COLOR_BGR2GRAY)
            bright_mask = np.clip((luminance - 0.55) / 0.45, 0.0, 1.0)
            bright_pass = result * bright_mask[:, :, None]
            bloom = cv2.GaussianBlur(bright_pass, (0, 0), 2.0 + p.glow * 10.0)
            result = np.clip(result + bloom * (0.9 * p.glow), 0.0, 1.0)

        if p.fade:
            result = result * (1.0 - p.fade) + 0.5 * p.fade

        if p.vignette:
            height, width = result.shape[:2]
            y, x = np.ogrid[:height, :width]
            distance = np.sqrt(((x - width / 2) / (width / 2)) ** 2 + ((y - height / 2) / (height / 2)) ** 2)
            mask = np.clip(1.0 - distance * p.vignette * 0.65, 0.25, 1.0)
            result *= mask[:, :, None]
        return np.clip(result, 0.0, 1.0)


ENGINE = FilterEngine()