// ==================== API Configuration ====================
// Ubah ini sesuai dengan URL backend Anda
const API_CONFIG = {
  // Development
  // BASE_URL: "http://localhost:5000/api/pks",

  // Production (uncomment jika deploy)
  // BASE_URL: 'http://192.168.1.100:5000/api/pks',
  BASE_URL: 'https://api.pkslppmupnyk.io/api/pks',
};

// ==================== Helper Functions ====================

/**
 * Menampilkan response message
 * @param {string} elementId - ID element untuk menampilkan pesan
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {boolean} isError - True jika error, false jika success
 */
function showResponse(elementId, message, isError = false) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = message;
  element.className = isError ? "response error" : "response success";
  element.style.display = "block";

  // Auto hide after 5 seconds
  setTimeout(() => {
    element.style.display = "none";
  }, 5000);
}

/**
 * Download file dari response
 * @param {Response} response - Fetch response object
 * @param {string} defaultFilename - Nama file default jika tidak ada di header
 */
async function downloadFromResponse(
  response,
  defaultFilename = "download.pdf"
) {
  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");
  let filename = defaultFilename;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);

  return filename;
}

/**
 * Validasi input tidak kosong
 * @param {string} value - Nilai yang akan divalidasi
 * @param {string} fieldName - Nama field untuk pesan error
 * @returns {boolean} - True jika valid
 */
function validateRequired(value, fieldName = "Field") {
  if (!value || value.trim() === "") {
    return { valid: false, message: `❌ ${fieldName} harus diisi!` };
  }
  return { valid: true };
}

/**
 * Handle error dari API
 * @param {Error} error - Error object
 * @returns {string} - Error message
 */
function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      "Server error"
    );
  } else if (error.request) {
    // Request made but no response
    return "Tidak dapat terhubung ke server. Pastikan server berjalan.";
  } else {
    // Something else happened
    return error.message || "Terjadi kesalahan";
  }
}

// Export untuk digunakan di file lain
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    API_CONFIG,
    showResponse,
    downloadFromResponse,
    validateRequired,
    handleApiError,
  };
}
