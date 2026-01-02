from ultralytics import YOLO

model = YOLO("yolov8n.pt")

def run_yolo(image_path):
	results = model(image_path, device="cpu")

	detections = []
	for r in results:
		for box in r.boxes:
			detections.append({
				"class": model.names[int(box.cls)],
				"confidence": float(box.conf),
				"bbox": [float(x) for x in box.xyxy[0]]
			})

	return detections
