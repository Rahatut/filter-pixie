import cv2
import numpy as np


def apply(image: np.ndarray, intensity: float = 1.0) -> np.ndarray:
    result = image.copy()

    gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
    result = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    alpha = 1.0 + 0.5 * intensity
    beta = -20 * intensity
    result = cv2.convertScaleAbs(result, alpha=alpha, beta=beta)

    h, w = result.shape[:2]
    center = (w // 2, h // 2)
    radius = min(h, w) // 2
    Y, X = np.ogrid[:h, :w]
    dist = np.sqrt((X - center[0])**2 + (Y - center[1])**2)
    vignette = np.clip(1 - (dist / radius) * 0.8 * intensity, 0.3, 1.0)
    vignette = np.stack([vignette] * 3, axis=-1)
    result = (result * vignette).astype(np.uint8)

    return result