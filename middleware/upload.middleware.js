import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import PKS from "../models/pks.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/scan_pks"));
  },
  // ...
  filename: async (req, file, cb) => {
    try {
      const { id, nomor } = req.params;
      let pksNomor = nomor;
      let existingPks = null;

      if (id && !nomor) {
        existingPks = await PKS.findById(id);
        if (existingPks) {
          pksNomor = existingPks.content.nomor;
        }
      } else if (nomor) {
        existingPks = await PKS.findOne({ "content.nomor": nomor });
      }

      const ext = path.extname(file.originalname);
      // --- PERUBAHAN DI SINI ---
      // Tidak perlu sanitasi lagi karena pksNomor sudah menggunakan '-'
      const filename = `uploadedfile_${pksNomor}${ext}`;
      // ------------------------

      // ... (sisa kode untuk menghapus file lama tidak berubah)

      cb(null, filename);
    } catch (error) {
      console.error("Error in filename generation:", error);
      cb(error, null);
    }
  },
  // ...
});

// Filter file: hanya PDF
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Multer config
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

export default upload;
