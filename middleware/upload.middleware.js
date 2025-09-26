import multer from "multer";
import path from "path";
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
      let pksId = id;

      // Jika menggunakan nomor, cari ID-nya dulu
      if (nomor && !id) {
        const pks = await PKS.findOne({ "content.nomor": nomor });
        if (pks) {
          pksId = pks._id.toString();
        }
      }

      const ext = path.extname(file.originalname);
      const filename = `uploadedfile_${pksId}${ext}`;
      cb(null, filename);
    } catch (error) {
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
