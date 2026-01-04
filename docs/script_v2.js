const thresholdSlider = document.getElementById("thresholdSlider");
const thresholdValue = document.getElementById("thresholdValue");

let lastDetections = [];



const API_BASE =
  location.hostname.includes("github.io")
	? "https://wildlife-backend-final.onrender.com"
	: "http://127.0.0.1:8000";

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const canvas = document.getElementById("overlay");
const resultList = document.getElementById("resultList");
const loader = document.getElementById("loader");

const ctx = canvas.getContext("2d");

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
function updateView() {
  const threshold = thresholdSlider.value / 100;

  const filtered = lastDetections.filter(
	d => d.confidence >= threshold
  );

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (filtered.length === 0) {
	resultList.innerHTML = "<p>No detections above threshold</p>";
	return;
  }

  drawDetections(filtered);
  renderResults(filtered);
}

/* ================= SEND IMAGE ================= */
async function sendImage() {
  if (!imageInput.files.length) {
	alert("Please select an image first");
	return;
  }

  loader.style.display = "block";
  resultList.innerHTML = "";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const formData = new FormData();
  formData.append("file", imageInput.files[0]);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 120000); 
  try {
	const response = await fetch(`${API_BASE}/detect`, {
	  method: "POST",
	  body: formData
	});
	catch (err) {
		loader.textContent = "Model is still warming up. Please retry in 30s.";
	}

	const data = await response.json();

	if (!Array.isArray(data.detections) || data.detections.length === 0) {
	  resultList.innerHTML = "<p>No detections found</p>";
	  return;
	}

	lastDetections = data.detections;
	updateView();

  } catch (err) {
	console.error(err);
	resultList.innerHTML = "<p>Error contacting backend</p>";
  } finally {
	loader.style.display = "none";
  }
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
  resultList.innerHTML = "";

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
thresholdSlider.addEventListener("input", () => {
  thresholdValue.textContent = `${thresholdSlider.value}%`;

  if (lastDetections.length) {
	updateView();
  }
});
