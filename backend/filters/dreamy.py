import cv2
import numpy as np


def apply(image: np.ndarray, intensity: float = 1.0) -> np.ndarray:
    result = image.copy().astype(np.float32) / 255.0

    blur_ksize = int(15 * intensity) | 1
    blurred = cv2.GaussianBlur(result, (blur_ksize, blur_ksize), 0)

    result = cv2.addWeighted(result, 0.5, blurred, 0.5, 0)

    brightness = 0.15 * intensity
    result = np.clip(result + brightness, 0, 1)

    color_shift = np.array([1.1, 1.0, 0.9]) * (1 + 0.1 * intensity)
    result = result * color_shift
    result = np.clip(result, 0, 1)

    return (result * 255).astype(np.uint8)