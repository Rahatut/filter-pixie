from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import cv2
import numpy as np

from filters import ENGINE, FILTER_NAMES, parameter_dict, preset_parameters

app = FastAPI(title="FilterPixie API")

configured_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
cors_origins = list(dict.fromkeys([
    "https://rahatut.github.io",
    "http://localhost:5173",
    "http://localhost:3000",
    *configured_origins,
]))

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


def make_polaroid(image: np.ndarray) -> np.ndarray:
    """Place the image on a white print with a deeper top margin."""
    height, width = image.shape[:2]
    print_width = max(1, int(width / 0.84))
    side_margin = int(print_width * 0.02)
    image_width = print_width - side_margin * 2
    image_height = max(1, int(height * image_width / width))
    resized = cv2.resize(image, (image_width, image_height), interpolation=cv2.INTER_AREA)
    top_margin = int(print_width * 0.06)
    bottom_margin = int(print_width * 0.06)
    canvas = np.full(
        (top_margin + image_height + bottom_margin, print_width, 3),
        255,
        dtype=np.uint8,
    )
    canvas[top_margin:top_margin + image_height, side_margin:side_margin + image_width] = resized
    return canvas


@app.get("/")
async def root():
    return {"message": "FilterPixie API", "filters": FILTER_NAMES}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/filters")
async def list_filters():
    return FILTER_NAMES


@app.get("/parameters")
async def list_parameters():
    return {
        "presets": {name: parameter_dict(preset_parameters(name)) for name in FILTER_NAMES},
        "parameters": [
            {"id": "brightness", "name": "Brightness", "min": -1, "max": 1, "step": 0.01, "group": "Exposure"},
            {"id": "contrast", "name": "Contrast", "min": 0, "max": 2, "step": 0.01, "group": "Tone"},
            {"id": "hue", "name": "Hue", "min": -360, "max": 360, "step": 1, "group": "Color"},
            {"id": "saturation", "name": "Saturation", "min": 0, "max": 2, "step": 0.01, "group": "Color"},
            {"id": "value", "name": "Value", "min": 0, "max": 2, "step": 0.01, "group": "Color"},
            {"id": "highlights", "name": "Highlights", "min": -1, "max": 1, "step": 0.01, "group": "Tone"},
            {"id": "shadows", "name": "Shadows", "min": -1, "max": 1, "step": 0.01, "group": "Tone"},
            {"id": "blur", "name": "Blur", "min": 0, "max": 1, "step": 0.01, "group": "Texture"},
            {"id": "grain", "name": "Grain", "min": 0, "max": 1, "step": 0.01, "group": "Texture"},
            {"id": "vignette", "name": "Vignette", "min": 0, "max": 1, "step": 0.01, "group": "Optical"},
            {"id": "fade", "name": "Fade", "min": 0, "max": 1, "step": 0.01, "group": "Optical"},
            {"id": "glow", "name": "Glow", "min": 0, "max": 1, "step": 0.01, "group": "Optical"},
        ],
    }


def render_filter(
    image: np.ndarray,
    filter_name: str,
    intensity: float,
    parameter_json: str,
    polaroid: bool = False,
) -> np.ndarray:
    if filter_name not in FILTER_NAMES:
        raise HTTPException(status_code=400, detail=f"Unknown filter: {filter_name}")
    try:
        overrides = json.loads(parameter_json) if parameter_json else {}
        if not isinstance(overrides, dict):
            raise ValueError("parameters must be a JSON object")
        parameters = preset_parameters(filter_name, intensity, overrides)
    except (TypeError, ValueError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    result = ENGINE.apply(image, parameters)
    return make_polaroid(result) if polaroid else result


@app.post("/apply-filter")
async def apply_filter(
    image: UploadFile = File(...),
    filter_name: str = Form(...),
    intensity: float = Form(1.0),
    parameters: str = Form("{}"),
    polaroid: bool = Form(False),
):
    img = read_image(image)
    filtered = render_filter(img, filter_name, intensity, parameters, polaroid)
    result_bytes = encode_image(filtered)

    return Response(content=result_bytes, media_type="image/png")


@app.post("/apply-filter/base64")
async def apply_filter_base64(
    image: UploadFile = File(...),
    filter_name: str = Form(...),
    intensity: float = Form(1.0),
    parameters: str = Form("{}"),
    polaroid: bool = Form(False),
):
    import base64

    img = read_image(image)
    filtered = render_filter(img, filter_name, intensity, parameters, polaroid)
    result_bytes = encode_image(filtered)
    b64 = base64.b64encode(result_bytes).decode('utf-8')

    return {"image": f"data:image/png;base64,{b64}", "filter": filter_name}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)