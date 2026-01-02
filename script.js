// ✅ Run ONLY after HTML is fully loaded
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("imageInput");
  const preview = document.getElementById("preview");
  const overlay = document.getElementById("overlay");
  const canvasWrap = document.getElementById("canvasWrap");
  const loader = document.getElementById("loader");
  const result = document.getElementById("result");

  // 🔴 SAFETY CHECK (prevents silent failure)
  if (!overlay) {
    console.error("Canvas with id='overlay' not found");
    return;
  }

  const ctx = overlay.getContext("2d");

  const API_BASE =
    location.hostname.includes("github.io")
      ? "https://wildlife-app.onrender.com"
      : "http://127.0.0.1:8000";

  const COLORS = [
    "#00E5FF",
    "#FF6D00",
    "#76FF03",
    "#FF1744",
    "#D500F9",
    "#FFD600"
  ];

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    preview.src = URL.createObjectURL(file);
    canvasWrap.classList.remove("hidden");
    result.textContent = "";

    preview.onload = () => {
      overlay.width = preview.clientWidth;
      overlay.height = preview.clientHeight;
      ctx.clearRect(0, 0, overlay.width, overlay.height);
    };
  });

  async function sendImage() {
    console.log("🚀 sendImage called");

    if (!input.files.length) {
      alert("Please select an image first");
      return;
    }

    loader.classList.remove("hidden");
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const formData = new FormData();
    formData.append("file", input.files[0]);

    try {
      const response = await fetch(`${API_BASE}/detect`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      console.log("BACKEND RESPONSE:", data);

      if (data.detections) {
        drawDetections(data.detections);
      } else {
        result.textContent = "⚠️ No detections returned";
      }
    } catch (err) {
      console.error(err);
      result.textContent = "❌ Request failed";
    } finally {
      loader.classList.add("hidden");
    }
  }

  function drawDetections(detections) {
    const scaleX = overlay.width / preview.naturalWidth;
    const scaleY = overlay.height / preview.naturalHeight;

    detections.forEach((det, i) => {
      if (det.confidence < 0.5) return;

      const [x1, y1, x2, y2] = det.bbox;
      const color = COLORS[i % COLORS.length];

      const x = x1 * scaleX;
      const y = y1 * scaleY;
      const w = (x2 - x1) * scaleX;
      const h = (y2 - y1) * scaleY;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      const label = `${det.class} ${(det.confidence * 100).toFixed(1)}%`;
      ctx.font = "12px Arial";
      const tw = ctx.measureText(label).width;

      ctx.fillStyle = color;
      ctx.fillRect(x, y - 16, tw + 6, 16);

      ctx.fillStyle = "#000";
      ctx.fillText(label, x + 3, y - 4);
    });
  }

  // ✅ EXPOSE FUNCTION TO HTML BUTTON
  window.sendImage = sendImage;
});
