from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_methods=["*"],
	allow_headers=["*"],
)

@app.get("/")
def home():
	return {"message": "FastAPI is working"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
	return {
		"filename": file.filename,
		"status": "Image received successfully"
	}
