// pkslppmupnyk/pks-lppm-api/pks-lppm-api-cdbb3090bc26c697114ce7081d0e9d3e3badd715/middleware/logoUpload.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import PKS from "../models/pks.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi storage untuk logo
const logoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dest = path.join(__dirname, "../uploads/logos");
    try {
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
        return cb(new Error("PKS ID is required for logo upload."), null);
      }

      // Cari PKS untuk menghapus logo lama jika ada
      const existingPks = await PKS.findById(id);
      if (existingPks && existingPks.logoUpload?.fileName) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads/logos",
          existingPks.logoUpload.fileName
        );
        await fs.unlink(oldFilePath).catch(() => {});
      }

      const ext = path.extname(file.originalname);
      const filename = `logo_${id}${ext}`; // Nama file standar: logo_[id_pks].[ext]

      cb(null, filename);
    } catch (error) {
      cb(error, null);
    }
  },
});

// Filter file: hanya izinkan gambar
const logoFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(
    new Error("Hanya file dengan format .jpeg, .jpg, atau .png yang diizinkan"),
    false
  );
};

// Konfigurasi Multer untuk logo
const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: logoFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // Batas ukuran file 2MB
  },
});

export default uploadLogo;
