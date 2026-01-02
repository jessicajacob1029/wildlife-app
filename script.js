const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const loader = document.getElementById("loader");
const result = document.getElementById("result");

// Image preview
input.addEventListener("change", () => {
  const file = input.files[0];
  if (!file) return;

  preview.src = URL.createObjectURL(file);
  preview.classList.remove("hidden");
  result.textContent = "";
});

async function sendImage() {
  if (!input.files.length) {
    alert("Please select an image first");
    return;
  }

  loader.classList.remove("hidden");
  result.textContent = "";

  const formData = new FormData();
  formData.append("file", input.files[0]);

  try {
    const response = await fetch(
      "https://wildlife-app.onrender.com/detect",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();
    result.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    result.textContent = "❌ Error connecting to server";
  } finally {
    loader.classList.add("hidden");
  }
}
