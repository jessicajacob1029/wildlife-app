console.log("✅ script_v2.js loaded");

/* ================= CONFIG ================= */
const API_BASE = "https://wildlife-backend-final.onrender.com";

/* ================= DOM ELEMENTS ================= */
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const canvas = document.getElementById("overlay");
const loader = document.getElementById("loader");
const resultList = document.getElementById("resultList");
const thresholdSlider = document.getElementById("thresholdSlider");
const thresholdValue = document.getElementById("thresholdValue");
const detectBtn = document.getElementById("detectBtn");

const ctx = canvas.getContext("2d");

/* ================= STATE ================= */
let lastDetections = [];

/* ================= IMAGE PREVIEW ================= */
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
	preview.src = reader.result;
	preview.onload = () => {
	  const rect = preview.getBoundingClientRect();
	  canvas.width = rect.width;
	  canvas.height = rect.height;
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
	};
  };
  reader.readAsDataURL(file);
});

/* ================= BUTTON WIRING ================= */
detectBtn.addEventListener("click", sendImage);

/* ================= THRESHOLD SLIDER ================= */
thresholdSlider.addEventListener("input", () => {
  thresholdValue.textContent = `${thresholdSlider.value}%`;
  if (lastDetections.length) {
	updateView();
  }
});

/* ================= SEND IMAGE ================= */
async function sendImage() {
  console.log("🚀 sendImage called");

  if (!imageInput.files.length) {
	alert("Please select an image first");
	return;
  }

  loader.style.display = "block";
  loader.textContent = "Detecting…";
  resultList.innerHTML = "";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const formData = new FormData();
  formData.append("file", imageInput.files[0]);

  try {
	console.log("1️⃣ Sending request to backend");

	const response = await fetch(`${API_BASE}/detect`, {
	  method: "POST",
	  body: formData
	});

	console.log("2️⃣ Response received");

	const data = await response.json();
	console.log("3️⃣ Parsed JSON:", data);

	if (!data.detections || !Array.isArray(data.detections)) {
	  resultList.innerHTML = "<p>No detections returned</p>";
	  return;
	}

	lastDetections = data.detections;
	updateView();

  } catch (err) {
	console.error("❌ Detection failed:", err);
	resultList.innerHTML = "<p>Error contacting backend</p>";
  } finally {
	loader.style.display = "none";
  }
}

/* ================= UPDATE VIEW ================= */
function updateView() {
  const threshold = thresholdSlider.value / 100;

  const filtered = lastDetections.filter(
	d => d.confidence >= threshold
  );

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  resultList.innerHTML = "";

  if (filtered.length === 0) {
	resultList.innerHTML = "<p>No detections above threshold</p>";
	return;
  }

  drawDetections(filtered);
  renderResults(filtered);
}

/* ================= DRAW BOXES ================= */
function drawDetections(detections) {
  const scaleX = canvas.width / preview.naturalWidth;
  const scaleY = canvas.height / preview.naturalHeight;

  ctx.lineWidth = 2;
  ctx.font = "13px Inter";

  detections.forEach(det => {
	const [x1, y1, x2, y2] = det.bbox;

	const x = x1 * scaleX;
	const y = y1 * scaleY;
	const w = (x2 - x1) * scaleX;
	const h = (y2 - y1) * scaleY;

	ctx.strokeStyle = "#00ff99";
	ctx.strokeRect(x, y, w, h);

	const label = `${det.class} ${(det.confidence * 100).toFixed(1)}%`;
	const textWidth = ctx.measureText(label).width;

	ctx.fillStyle = "#00ff99";
	ctx.fillRect(x, y - 18, textWidth + 6, 18);

	ctx.fillStyle = "#000";
	ctx.fillText(label, x + 3, y - 4);
  });
}

/* ================= RESULTS LIST ================= */
function renderResults(detections) {
  detections.forEach(det => {
	const item = document.createElement("div");
	item.className = "result-item";
	item.innerHTML = `
	  <span class="label">${det.class}</span>
	  <span class="conf">${(det.confidence * 100).toFixed(1)}%</span>
	`;
	resultList.appendChild(item);
  });
}
