import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import PKS from "../models/pks.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi storage untuk Multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dest = path.join(__dirname, "../uploads/scan_pks");
    try {
      // Pastikan direktori tujuan ada
      await fs.mkdir(dest, { recursive: true });
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },
  filename: async (req, file, cb) => {
    try {
      const { id } = req.params;
      if (!id) {
        return cb(new Error("PKS ID is required for file upload."), null);
      }

      // Cari PKS untuk menghapus file lama jika ada
      const existingPks = await PKS.findById(id);
      if (existingPks && existingPks.fileUpload.fileName) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads/scan_pks",
          existingPks.fileUpload.fileName
        );
        // Coba hapus file lama, abaikan jika gagal (misal: file tidak ada)
        await fs.unlink(oldFilePath).catch(() => {});
      }

      const ext = path.extname(file.originalname);
      // Gunakan ID unik dari PKS sebagai nama file
      const filename = `uploadedfile_${id}${ext}`;

      cb(null, filename);
    } catch (error) {
      console.error("Error in filename generation:", error);
      cb(error, null);
    }
  },
});

// Filter file: hanya izinkan PDF
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file dengan format .pdf yang diizinkan"), false);
  }
};

// Konfigurasi Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Batas ukuran file 10MB
  },
});

export default upload;
