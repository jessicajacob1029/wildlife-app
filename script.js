// ===============================
// CONFIG
// ===============================
const API_BASE =
  location.hostname.includes("github.io")
    ? "https://wildlife-backend-final.onrender.com"
    : "http://127.0.0.1:8000";

// ===============================
// DOM ELEMENTS
// ===============================
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const canvas = document.getElementById("overlay");
const result = document.getElementById("result");
const loader = document.getElementById("loader");

const ctx = canvas.getContext("2d");

// ===============================
// IMAGE PREVIEW
// ===============================
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

// ===============================
// SEND IMAGE TO BACKEND
// ===============================
async function sendImage() {
  console.log("🚀 sendImage called");

  if (!imageInput.files.length) {
    alert("Please select an image first");
    return;
  }

  loader.style.display = "block";
  result.textContent = "";

  const formData = new FormData();
  formData.append("file", imageInput.files[0]);

  try {
    const response = await fetch(`${API_BASE}/detect`, {
      method: "POST",
      body: formData
    });

    console.log("RAW RESPONSE:", response);

    const data = await response.json();
    console.log("PARSED DATA:", data);
    console.log("DETECTIONS FIELD:", data.detections);

    // ===============================
    // VALIDATION (IMPORTANT)
    // ===============================
    if (!Array.isArray(data.detections) || data.detections.length === 0) {
      result.textContent = "⚠️ No detections returned";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      loader.style.display = "none";
      return;
    }

    // ===============================
    // SUCCESS
    // ===============================
    result.textContent = JSON.stringify(data, null, 2);
    drawDetections(data.detections);
  } catch (err) {
    console.error("ERROR:", err);
    result.textContent = "❌ Error contacting backend";
  }

  loader.style.display = "none";
}

// ===============================
// DRAW BOUNDING BOXES
// ===============================
function drawDetections(detections) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;
  ctx.font = "14px Arial";

  detections.forEach(det => {
    const [x1, y1, x2, y2] = det.bbox;
    const width = x2 - x1;
    const height = y2 - y1;

    // Box
    ctx.strokeStyle = "lime";
    ctx.strokeRect(x1, y1, width, height);

    // Label background
    const label = `${det.class} ${(det.confidence * 100).toFixed(1)}%`;
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = "lime";
    ctx.fillRect(x1, y1 - 18, textWidth + 6, 18);

    // Label text
    ctx.fillStyle = "black";
    ctx.fillText(label, x1 + 3, y1 - 4);
  });
}
