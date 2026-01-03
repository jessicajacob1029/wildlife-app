console.log("🚨 SCRIPT VERSION 999 LOADED");


const API_BASE =
  location.hostname.includes("github.io")
	? "https://wildlife-backend-final.onrender.com"
	: "http://127.0.0.1:8000";

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const canvas = document.getElementById("overlay");
const result = document.getElementById("result");
const loader = document.getElementById("loader");

const ctx = canvas.getContext("2d");

// Preview image
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
	preview.src = reader.result;
	preview.onload = () => {
	  canvas.width = preview.width;
	  canvas.height = preview.height;
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
	};
  };
  reader.readAsDataURL(file);
});

async function sendImage() {
  console.log("🚀 sendImage START");

  if (!imageInput.files.length) {
	alert("Select an image first");
	return;
  }

  loader.style.display = "block";
  result.textContent = "Detecting...";

  const formData = new FormData();
  formData.append("file", imageInput.files[0]);

  try {
	console.log("📡 Sending request to backend");

	const response = await fetch(`${API_BASE}/detect`, {
	  method: "POST",
	  body: formData
	});

	console.log("✅ Response received");

	const data = await response.json();
	console.log("📦 Parsed JSON:", data);

	if (!Array.isArray(data.detections)) {
	  result.textContent = "❌ Backend response invalid";
	  console.error("Invalid response shape", data);
	  return;
	}

	if (data.detections.length === 0) {
	  result.textContent = "⚠️ No detections returned";
	  return;
	}

	result.textContent = JSON.stringify(data, null, 2);
	drawDetections(data.detections);
  } catch (err) {
	console.error("🔥 Fetch failed:", err);
	result.textContent = "❌ Error contacting backend";
  } finally {
	console.log("🧹 sendImage END");
	loader.style.display = "none";
  }
}

function drawDetections(detections) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;
  ctx.font = "14px Arial";

  detections.forEach(det => {
	const [x1, y1, x2, y2] = det.bbox;
	const w = x2 - x1;
	const h = y2 - y1;

	ctx.strokeStyle = "lime";
	ctx.strokeRect(x1, y1, w, h);

	const label = `${det.class} ${(det.confidence * 100).toFixed(1)}%`;
	const textWidth = ctx.measureText(label).width;

	ctx.fillStyle = "lime";
	ctx.fillRect(x1, y1 - 18, textWidth + 6, 18);

	ctx.fillStyle = "black";
	ctx.fillText(label, x1 + 3, y1 - 4);
  });
}
