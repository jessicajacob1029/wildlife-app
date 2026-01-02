from ultralytics import YOLO

# YOLOv8n (stable on macOS)
model = YOLO("yolov8n.pt")

def run_yolo(image):
	results = model(image)[0]

	detections = []
	for box in results.boxes:
		detections.append({
			"class": model.names[int(box.cls)],
			"confidence": float(box.conf),
			"bbox": box.xyxy[0].tolist()
		})

	return detections
