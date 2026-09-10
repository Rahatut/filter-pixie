import cv2
import numpy as np


def apply(image: np.ndarray, intensity: float = 1.0) -> np.ndarray:
    result = image.copy().astype(np.float32) / 255.0

    gray = cv2.cvtColor((result * 255).astype(np.uint8), cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edges = edges.astype(np.float32) / 255.0
    edges = cv2.GaussianBlur(edges, (3, 3), 0)

    edge_strength = 2.0 * intensity
    edges = np.clip(edges * edge_strength, 0, 1)

    neon_color = np.array([0.0, 1.0, 1.0])
    edge_rgb = np.stack([edges] * 3, axis=-1) * neon_color

    result = np.clip(result + edge_rgb, 0, 1)

    brightness = 0.2 * intensity
    result = np.clip(result + brightness, 0, 1)

    contrast = 1.0 + 0.3 * intensity
    result = np.clip((result - 0.5) * contrast + 0.5, 0, 1)

    return (result * 255).astype(np.uint8)