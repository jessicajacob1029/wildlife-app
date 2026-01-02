from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uuid, shutil, os
import numpy as np


from backend.model.yolo import run_yolo
from backend.model.fusion import fuse_image


app = FastAPI(title="Wildlife Detection API")
print("🔥 RUNNING backend/main.py 🔥")

# Enable CORS (frontend → backend)
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/")
def root():
	return {"message": "RUNNING NEW BACKEND MAIN.PY"}

def health_check():
	return {"status": "Backend running successfully"}

@app.post("/detect_v2")

async def detect(file: UploadFile = File(...)):
	"""
	Pipeline:
	1. Read uploaded image
	2. Decode image
	3. Run fusion
	4. Run YOLO
	5. Return detections
	"""

	contents = await file.read()

	image_np = np.frombuffer(contents, np.uint8)
	image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

	if image is None:
		return {"error": "Invalid image file"}

	fused_image = fuse_image(image)
	detections = run_yolo(fused_image)

	return {
		"message": "🔥 THIS IS THE NEW DETECT V2 🔥",
		"num_detections": len(detections),
		"detections": detections
	}
