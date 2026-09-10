from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import os
import cv2
import numpy as np
from PIL import Image
import io

from filters import FILTERS, FILTER_NAMES

app = FastAPI(title="FilterPixie API")

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "https://rahatut.github.io",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_IMAGE_DIMENSION = 2000


def read_image(file: UploadFile) -> np.ndarray:
    contents = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image must be 10 MB or smaller")

    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    height, width = image.shape[:2]
    largest_dimension = max(height, width)
    if largest_dimension > MAX_IMAGE_DIMENSION:
        scale = MAX_IMAGE_DIMENSION / largest_dimension
        image = cv2.resize(image, (int(width * scale), int(height * scale)), interpolation=cv2.INTER_AREA)

    return image


def encode_image(image: np.ndarray) -> bytes:
    _, buffer = cv2.imencode('.png', image)
    return buffer.tobytes()


@app.get("/")
async def root():
    return {"message": "FilterPixie API", "filters": FILTER_NAMES}


@app.get("/filters")
async def list_filters():
    return FILTER_NAMES


@app.post("/apply-filter")
async def apply_filter(
    image: UploadFile = File(...),
    filter_name: str = Form(...),
    intensity: float = Form(1.0),
):
    if filter_name not in FILTERS:
        raise HTTPException(status_code=400, detail=f"Unknown filter: {filter_name}")

    img = read_image(image)
    filtered = FILTERS[filter_name](img, intensity=intensity)
    result_bytes = encode_image(filtered)

    return Response(content=result_bytes, media_type="image/png")


@app.post("/apply-filter/base64")
async def apply_filter_base64(
    image: UploadFile = File(...),
    filter_name: str = Form(...),
    intensity: float = Form(1.0),
):
    import base64

    if filter_name not in FILTERS:
        raise HTTPException(status_code=400, detail=f"Unknown filter: {filter_name}")

    img = read_image(image)
    filtered = FILTERS[filter_name](img, intensity=intensity)
    result_bytes = encode_image(filtered)
    b64 = base64.b64encode(result_bytes).decode('utf-8')

    return {"image": f"data:image/png;base64,{b64}", "filter": filter_name}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)