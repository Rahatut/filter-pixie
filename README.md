# FilterPixie

FilterPixie is a lightweight web app for transforming photos with computer vision. Upload an image, choose an effect style, adjust its intensity, and download the result as a PNG.

The project combines a React and Vite frontend with a Python FastAPI backend. Image processing happens on demand and images are returned directly to the browser without permanent storage.

## Features

- Dreamy, noir, vintage, sketch, and neon filters
- Adjustable filter intensity
- In-memory image processing with OpenCV

## Live app

https://rahatut.github.io/filter-pixie/

## Run locally

Start the backend in one terminal:

```bash
cd backend && source venv/bin/activate && uvicorn main:app --reload
```

Start the frontend in another:

```bash
cd frontend && npm install && npm run dev
```

Open the local Vite URL shown in the terminal. The frontend proxies API requests to `http://localhost:8000`.

## Deployment

### GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` builds and deploys the frontend automatically whenever `main` changes. GitHub repository settings must use **Settings > Pages > Source: GitHub Actions**.

### Render

The backend runs as a Render **Web Service** with:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

The backend allows the GitHub Pages origin by default. For a different frontend domain, set this Render environment variable:

```env
CORS_ORIGINS=https://your-frontend.example.com
```

## Project structure

```text
backend/   FastAPI API and OpenCV filters
frontend/  React and Vite application
```
