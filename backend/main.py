from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uuid, shutil, os
import numpy as np
import cv2


from model.yolo import run_yolo
from model.fusion import fuse_image



app = FastAPI(title="Wildlife Detection API")
print("🔥 RUNNING backend/main.py 🔥")

# Enable CORS (frontend → backend)
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_methods=["*"],
	allow_headers=["*"],
)
@app.get("/warmup")
def warmup():
	return {"status": "model ready"}


@app.get("/")
def root():
	return {"message": "RUNNING NEW BACKEND MAIN.PY"}

def health_check():
	return {"status": "Backend running successfully"}

@app.post("/detect_v2")

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
	try:
		temp_filename = f"temp_{uuid.uuid4().hex}.jpg"

		with open(temp_filename, "wb") as buffer:
			shutil.copyfileobj(file.file, buffer)

		detections = run_yolo(temp_filename)

		os.remove(temp_filename)

		return {
			"filename": file.filename,
			"num_detections": len(detections),
			"detections": detections
		}

	except Exception as e:
		return {
			"error": str(e),
			"type": type(e).__name__
		}
