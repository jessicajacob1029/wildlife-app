from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import time
import numpy as np
import cv2


from model.yolo import run_yolo



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
		start = time.time()
		contents = await file.read()
		if not contents:
			return {"error": "Empty file upload", "type": "ValueError"}

		np_buffer = np.frombuffer(contents, np.uint8)
		image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
		if image is None:
			return {"error": "Unable to decode image", "type": "ValueError"}

		detections = run_yolo(image)
		latency_ms = int((time.time() - start) * 1000)

		return {
			"filename": file.filename,
			"num_detections": len(detections),
			"detections": detections,
			"latency_ms": latency_ms
		}

	except Exception as e:
		return {
			"error": str(e),
			"type": type(e).__name__
		}
