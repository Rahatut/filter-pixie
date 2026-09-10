import cv2
import numpy as np


def apply(image: np.ndarray, intensity: float = 1.0) -> np.ndarray:
    result = image.copy()

    gray = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)

    inverted = 255 - gray

    blur_ksize = int(21 * intensity) | 1
    blurred = cv2.GaussianBlur(inverted, (blur_ksize, blur_ksize), 0)

    inverted_blur = 255 - blurred

    sketch = cv2.divide(gray, inverted_blur, scale=256.0)

    alpha = 1.0 + 0.5 * intensity
    sketch = cv2.convertScaleAbs(sketch, alpha=alpha, beta=0)

    result = cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)

    return result