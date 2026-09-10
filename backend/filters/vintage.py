import cv2
import numpy as np


def apply(image: np.ndarray, intensity: float = 1.0) -> np.ndarray:
    result = image.copy().astype(np.float32) / 255.0

    vintage_matrix = np.array([
        [0.393, 0.769, 0.189],
        [0.349, 0.686, 0.168],
        [0.272, 0.534, 0.131]
    ])
    result = cv2.transform(result, vintage_matrix)
    result = np.clip(result, 0, 1)

    alpha = 1.0 + 0.3 * intensity
    beta = -0.1 * intensity
    result = np.clip(result * alpha + beta, 0, 1)

    h, w = result.shape[:2]
    noise = np.random.normal(0, 0.03 * intensity, (h, w, 3))
    result = np.clip(result + noise, 0, 1)

    sepia = np.array([1.1, 1.0, 0.9])
    result = result * sepia
    result = np.clip(result, 0, 1)

    return (result * 255).astype(np.uint8)