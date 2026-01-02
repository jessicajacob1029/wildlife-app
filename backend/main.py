from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import uuid
import os

from model.yolo import run_yolo

app = FastAPI()

# --- CORS (required for GitHub Pages → Render) ---
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_methods=["*"],
	allow_headers=["*"],
)

@app.get("/")
def root():
	return {"message": "Wildlife Detection API is running"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
	# Save uploaded image temporarily
	temp_filename = f"temp_{uuid.uuid4().hex}.jpg"

	with open(temp_filename, "wb") as buffer:
		shutil.copyfileobj(file.file, buffer)

	# Run YOLO detection
	detections = run_yolo(temp_filename)

	# Cleanup temp file
	os.remove(temp_filename)

	# IMPORTANT: return detections (frontend expects this)
	return {
		"filename": file.filename,
		"num_detections": len(detections),
		"detections": detections
	}

