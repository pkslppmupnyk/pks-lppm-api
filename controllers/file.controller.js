import PKS from "../models/pks.model.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function untuk mencari PKS by nomor
const findPKSByNomor = async (nomor) => {
  const pks = await PKS.findOne({ "content.nomor": nomor });
  return pks;
};

// ==================== FILE OPERATIONS BY NOMOR (DEFAULT) ====================

// UPLOAD FILE BY NOMOR
export const uploadFile = async (req, res) => {
  try {
    const { nomor } = req.params;

    // Cari PKS berdasarkan nomor
    const pks = await findPKSByNomor(nomor);
    if (!pks) {
      // Hapus file yang sudah diupload jika PKS tidak ditemukan
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res
        .status(404)
        .json({ message: "PKS not found with nomor: " + nomor });
    }

    // Cek apakah file ada
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Hapus file lama jika ada
    if (pks.fileUpload.fileName) {
      const oldFilePath = path.join(
        __dirname,
        "../file",
        pks.fileUpload.fileName
      );
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.log("Old file not found or already deleted");
      }
    }

    // Update database dengan info file baru
    pks.fileUpload.docName = req.file.originalname;
    pks.fileUpload.fileName = req.file.filename;
    await pks.save();

    res.status(200).json({
      message: "File uploaded successfully",
      data: {
        nomor: pks.content.nomor,
        docName: pks.fileUpload.docName,
        fileName: pks.fileUpload.fileName,
      },
    });
  } catch (err) {
    // Hapus file jika terjadi error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }
    res.status(500).json({ error: err.message });
  }
};

// DOWNLOAD FILE BY NOMOR
export const downloadFile = async (req, res) => {
  try {
    const { nomor } = req.params;

    const pks = await findPKSByNomor(nomor);
    if (!pks) {
      return res
        .status(404)
        .json({ message: "PKS not found with nomor: " + nomor });
    }

    if (!pks.fileUpload.fileName) {
      return res.status(404).json({ message: "No file uploaded for this PKS" });
    }

    const filePath = path.join(__dirname, "../file", pks.fileUpload.fileName);

    // Cek apakah file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Download dengan nama asli
    res.download(filePath, pks.fileUpload.docName, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ error: "Error downloading file" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE FILE BY NOMOR
export const deleteFile = async (req, res) => {
  try {
    const { nomor } = req.params;

    const pks = await findPKSByNomor(nomor);
    if (!pks) {
      return res
        .status(404)
        .json({ message: "PKS not found with nomor: " + nomor });
    }

    if (!pks.fileUpload.fileName) {
      return res.status(404).json({ message: "No file to delete" });
    }

    // Hapus file dari folder
    const filePath = path.join(__dirname, "../file", pks.fileUpload.fileName);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.log("File not found on server, will clear database record");
    }

    // Hapus info file dari database
    pks.fileUpload.docName = "";
    pks.fileUpload.fileName = "";
    await pks.save();

    res.status(200).json({
      message: "File deleted successfully",
      nomor: nomor,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== FILE OPERATIONS BY ID ====================

// UPLOAD FILE BY ID
export const uploadFileById = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah PKS exists
    const pks = await PKS.findById(id);
    if (!pks) {
      // Hapus file yang sudah diupload jika PKS tidak ditemukan
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(404).json({ message: "PKS not found" });
    }

    // Cek apakah file ada
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Hapus file lama jika ada
    if (pks.fileUpload.fileName) {
      const oldFilePath = path.join(
        __dirname,
        "../file",
        pks.fileUpload.fileName
      );
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.log("Old file not found or already deleted");
      }
    }

    // Update database dengan info file baru
    pks.fileUpload.docName = req.file.originalname;
    pks.fileUpload.fileName = req.file.filename;
    await pks.save();

    res.status(200).json({
      message: "File uploaded successfully",
      data: {
        docName: pks.fileUpload.docName,
        fileName: pks.fileUpload.fileName,
      },
    });
  } catch (err) {
    // Hapus file jika terjadi error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }
    res.status(500).json({ error: err.message });
  }
};

// DOWNLOAD FILE BY ID
export const downloadFileById = async (req, res) => {
  try {
    const { id } = req.params;

    const pks = await PKS.findById(id);
    if (!pks) {
      return res.status(404).json({ message: "PKS not found" });
    }

    if (!pks.fileUpload.fileName) {
      return res.status(404).json({ message: "No file uploaded for this PKS" });
    }

    const filePath = path.join(__dirname, "../file", pks.fileUpload.fileName);

    // Cek apakah file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Download dengan nama asli
    res.download(filePath, pks.fileUpload.docName, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ error: "Error downloading file" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE FILE BY ID
export const deleteFileById = async (req, res) => {
  try {
    const { id } = req.params;

    const pks = await PKS.findById(id);
    if (!pks) {
      return res.status(404).json({ message: "PKS not found" });
    }

    if (!pks.fileUpload.fileName) {
      return res.status(404).json({ message: "No file to delete" });
    }

    // Hapus file dari folder
    const filePath = path.join(__dirname, "../file", pks.fileUpload.fileName);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.log("File not found on server, will clear database record");
    }

    // Hapus info file dari database
    pks.fileUpload.docName = "";
    pks.fileUpload.fileName = "";
    await pks.save();

    res.status(200).json({
      message: "File deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
