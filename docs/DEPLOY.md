# Deployment Guide

## Frontend (GitHub Pages)
1. In GitHub, open the repo settings.
2. Go to **Pages**.
3. Set:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/docs`
4. The live URL will be shown at the top.

## Backend (Render)
This repo includes `render.yaml` at the root for a one-click deploy.

1. Go to Render and create a **New Web Service**.
2. Connect the GitHub repo.
3. Render will detect `render.yaml` and use:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root: `backend`
4. Deploy.

## Connect Frontend to Backend
Update `docs/script_v2.js`:

```js
const API_BASE = "https://<your-render-service>.onrender.com";
```

Then commit and push. GitHub Pages will redeploy the frontend.
