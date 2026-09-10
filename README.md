# filter-pixie
A web app for image processing and filters using computer vision fundamentals

## Run locally

Start the API from `backend/`, then start the frontend from `frontend/`:

```bash
uvicorn main:app --reload
npm install
npm run dev
```
The site is available at:

`https://rahatut.github.io/filter-pixie/`

## Environment variables

For local frontend development, no environment file is required. The Vite proxy forwards API requests to `http://localhost:8000`.

If you want to call the local API directly, create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

Then run the backend with both origins allowed:

```env
CORS_ORIGINS=http://localhost:5173,https://rahatut.github.io
```

For the GitHub Pages build, add this repository variable at **Settings > Secrets and variables > Actions > Variables**:

```text
Name: VITE_API_URL
Value: https://your-deployed-api.example.com
```

On the server hosting FastAPI, set:

```env
CORS_ORIGINS=https://rahatut.github.io
```

Do not commit `.env.local`, and do not put the backend URL in frontend source code. The GitHub Actions workflow injects `VITE_API_URL` during the Pages build.
