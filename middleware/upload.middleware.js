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
    cb(null, path.join(__dirname, "../file"));
  },
  filename: async (req, file, cb) => {
    try {
      const { id, nomor } = req.params;
      let pksNomor = nomor;
      let existingPks = null;

      // Jika menggunakan ID, cari nomor PKS-nya dulu
      if (id && !nomor) {
        existingPks = await PKS.findById(id);
        if (existingPks) {
          pksNomor = existingPks.content.nomor;
        }
      } else if (nomor) {
        // Jika menggunakan nomor, cari PKS-nya untuk mendapatkan info file lama
        existingPks = await PKS.findOne({ "content.nomor": nomor });
      }

      const ext = path.extname(file.originalname);
      const filename = `uploadedfile_${pksNomor}${ext}`;

      // Hapus file lama jika ada sebelum membuat file baru
      if (existingPks && existingPks.fileUpload.fileName) {
        const oldFilePath = path.join(
          __dirname,
          "../file",
          existingPks.fileUpload.fileName
        );
        try {
          await fs.access(oldFilePath); // Check if file exists
          await fs.unlink(oldFilePath); // Delete old file
          console.log(`Deleted old file: ${existingPks.fileUpload.fileName}`);
        } catch (err) {
          console.log(
            "Old file not found or already deleted:",
            existingPks.fileUpload.fileName
          );
        }
      }

      cb(null, filename);
    } catch (error) {
      console.error("Error in filename generation:", error);
      cb(error, null);
    }
  },
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
