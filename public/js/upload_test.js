// Upload File Function
async function uploadFile() {
  const nomor = document.getElementById("uploadNomor").value.trim();
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  // Validasi nomor
  const nomorValidation = validateRequired(nomor, "Nomor PKS");
  if (!nomorValidation.valid) {
    showResponse("uploadResponse", nomorValidation.message, true);
    return;
  }

  // Validasi file
  if (!file) {
    showResponse("uploadResponse", "❌ Pilih file terlebih dahulu!", true);
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/${nomor}/file`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      showResponse(
        "uploadResponse",
        `✅ ${data.message} - File: ${data.data.fileName}`
      );
      fileInput.value = "";
    } else {
      showResponse("uploadResponse", `❌ ${data.message || data.error}`, true);
    }
  } catch (error) {
    showResponse("uploadResponse", `❌ Error: ${handleApiError(error)}`, true);
  }
}

// Download File Function
async function downloadFile() {
  const nomor = document.getElementById("downloadNomor").value.trim();

  // Validasi nomor
  const nomorValidation = validateRequired(nomor, "Nomor PKS");
  if (!nomorValidation.valid) {
    showResponse("downloadResponse", nomorValidation.message, true);
    return;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/${nomor}/file`);

    if (response.ok) {
      const filename = await downloadFromResponse(response);
      showResponse(
        "downloadResponse",
        `✅ File berhasil didownload: ${filename}`
      );
    } else {
      const data = await response.json();
      showResponse(
        "downloadResponse",
        `❌ ${data.message || data.error}`,
        true
      );
    }
  } catch (error) {
    showResponse(
      "downloadResponse",
      `❌ Error: ${handleApiError(error)}`,
      true
    );
  }
}

// Delete File Function
async function deleteFile() {
  const nomor = document.getElementById("deleteNomor").value.trim();

  // Validasi nomor
  const nomorValidation = validateRequired(nomor, "Nomor PKS");
  if (!nomorValidation.valid) {
    showResponse("deleteResponse", nomorValidation.message, true);
    return;
  }

  if (!confirm("Apakah Anda yakin ingin menghapus file ini?")) {
    return;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/${nomor}/file`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      showResponse("deleteResponse", `✅ ${data.message}`);
    } else {
      showResponse("deleteResponse", `❌ ${data.message || data.error}`, true);
    }
  } catch (error) {
    showResponse("deleteResponse", `❌ Error: ${handleApiError(error)}`, true);
  }
}

// Generate Document Function
async function generateDocument() {
  const nomor = document.getElementById("generateNomor").value.trim();

  // Validasi nomor
  const nomorValidation = validateRequired(nomor, "Nomor PKS");
  if (!nomorValidation.valid) {
    showResponse("generateResponse", nomorValidation.message, true);
    return;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/${nomor}/generate`);

    if (response.ok) {
      const blob = await response.blob();
      const filename =
        response.headers
          .get("Content-Disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || `pks-${nomor}.docx`;

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      showResponse(
        "generateResponse",
        `✅ Dokumen berhasil digenerate dan diunduh: ${filename}`
      );
    } else {
      const data = await response.json();
      showResponse(
        "generateResponse",
        `❌ ${data.message || data.error}`,
        true
      );
    }
  } catch (error) {
    showResponse(
      "generateResponse",
      `❌ Error: ${handleApiError(error)}`,
      true
    );
  }
}
