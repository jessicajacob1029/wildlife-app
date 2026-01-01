async function sendImage() {
  const input = document.getElementById("imageInput");
  const result = document.getElementById("result");

  if (input.files.length === 0) {
    alert("Please select an image");
    return;
  }

  const formData = new FormData();
  formData.append("file", input.files[0]);

  const response = await fetch(
    "https://wildlife-app.onrender.com/detect",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();
  result.textContent = JSON.stringify(data, null, 2);
}
