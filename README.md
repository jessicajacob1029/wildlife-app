# Object Detection App

This project provides:
- A static frontend for uploading an image and visualizing detections.
- A FastAPI backend that runs YOLOv8 object detection on CPU.

Current frontend URL:
- https://jessicajacob1029.github.io/object-detection-app/

Current backend URL:
- https://<your-render-service>.onrender.com

## Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript (`/docs`)
- Backend: FastAPI + Ultralytics YOLOv8 (`/backend`)
- Hosting (frontend): GitHub Pages (`main` branch, `/docs` folder)
- Hosting (backend): Render (configured by `render.yaml`)

## Project Structure

```text
object-detection-app/
  backend/
    main.py
    requirements.txt
    model/
      yolo.py
  docs/
    index.html
    style.css
    script_v2.js
    DEPLOY.md
  render.yaml
  README.md
```

## Run Locally

### 1) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- `http://localhost:8000`

### 2) Frontend

From repo root:

```bash
cd docs
python3 -m http.server 5500
```

Frontend will be available at:
- `http://localhost:5500`

If running backend locally, update `API_BASE` in `docs/script_v2.js` to:
- `http://localhost:8000`

## API Endpoints

- `GET /`  
Basic backend status message.

- `GET /warmup`  
Used by frontend status badge to check/warm backend.

- `POST /detect`  
Multipart form upload with field name `file`.

Example response:

```json
{
  "filename": "example.jpg",
  "num_detections": 3,
  "detections": [
    {
      "class": "bird",
      "confidence": 0.91,
      "bbox": [100.2, 50.1, 210.7, 180.9]
    }
  ],
  "latency_ms": 412
}
```

## Deployment

### Frontend (GitHub Pages)

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/docs`

### Backend (Render)

`render.yaml` is already included:

```yaml
services:
  - type: web
    name: object-detection-backend
    env: python
    rootDir: backend
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

For more detail, see:
- `docs/DEPLOY.md`

## Performance Notes

- Inference runs on CPU (`device="cpu"`).
- Uploaded images are decoded in memory (no temporary file writes).
- Model layers are fused at startup for lower inference overhead.
- Render free tier may sleep when idle, so first request can be slower.

## Common Issues

- `403` on `git push`: use a GitHub Personal Access Token with `Contents: Read and write`.
- Frontend cannot reach backend: verify `API_BASE` in `docs/script_v2.js`.
- Slow first request on Render: expected on free tier cold starts.
