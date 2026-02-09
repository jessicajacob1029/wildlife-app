from ultralytics import YOLO

model = YOLO("yolov8n.pt")
model.fuse()

def run_yolo(image, imgsz=640):
	results = model.predict(image, imgsz=imgsz, device="cpu", verbose=False)

	detections = []
	for r in results:
		for box in r.boxes:
			detections.append({
				"class": model.names[int(box.cls)],
				"confidence": float(box.conf),
				"bbox": [float(x) for x in box.xyxy[0]]
			})

	return detections
