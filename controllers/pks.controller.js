import PKS from "../models/pks.model.js";
import DocNumber from "../models/numbering.model.js";
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

// Helper function untuk hapus file
const deleteFileFromServer = async (fileName) => {
  if (!fileName) return;

  try {
    const filePath = path.join(__dirname, "../uploads/scan_pks", fileName);
    await fs.unlink(filePath);
    console.log(`File deleted: ${fileName}`);
  } catch (err) {
    console.log(`File not found or already deleted: ${fileName}`);
  }
};

// CREATE
// ... (import dan fungsi helper lainnya)

// CREATE
export const createPKS = async (req, res) => {
  try {
    // ... (langkah 1 & 2 tidak berubah)

    // 3. Jika validasi OK, baru generate nomor
    const seq = await DocNumber.getNextSeq("PKS");
    const year = new Date().getFullYear();

    // --- PERUBAHAN UTAMA DI SINI ---
    // Buat nomor dengan format garis miring dulu
    const originalNomor = `${seq}/UN62.21/KS.00.00/${year}`;
    // Simpan ke database dengan format tanda hubung
    const nomor = originalNomor.replace(/\//g, "-");
    // ------------------------------------

    // 4. Set nomor yang benar
    pksTemp.content.nomor = nomor;

    // 5. Save ke database
    const saved = await pksTemp.save();

    res.status(201).json({
      message: "PKS created successfully",
      data: saved,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ... (sisa fungsi tidak berubah)
// READ ALL (optional filter + pagination)
export const getAllPKS = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) filter["properties.status"] = status;

    const data = await PKS.find(filter)
      .sort({ "properties.uploadDate": -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await PKS.countDocuments(filter);

    res.json({
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== READ BY NOMOR (DEFAULT) ====================

// READ ONE by NOMOR
export const getPKSByNomor = async (req, res) => {
  try {
    const { nomor } = req.params;
    const pks = await findPKSByNomor(nomor);

    if (!pks) {
      return res
        .status(404)
        .json({ message: "PKS not found with nomor: " + nomor });
    }

    res.json(pks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE by NOMOR
export const updatePKSByNomor = async (req, res) => {
  try {
    const { nomor } = req.params;
    const updateData = req.body;

    const pks = await findPKSByNomor(nomor);
    if (!pks) {
      return res
        .status(404)
        .json({ message: "PKS not found with nomor: " + nomor });
    }

    // 🛡️ SOLUSI TERBAIK: Hapus nomor dari updateData untuk mencegah overwrite
    if (updateData.content && updateData.content.nomor) {
      delete updateData.content.nomor; // Jangan izinkan update nomor sama sekali
    }

    // Lalu gunakan $set untuk nested fields
    const updateQuery = {};

    // Update content fields (kecuali nomor)
    if (updateData.content) {
      Object.keys(updateData.content).forEach((key) => {
        if (key !== "nomor") {
          updateQuery[`content.${key}`] = updateData.content[key];
        }
      });
    }

    // Update pihakKedua
    if (updateData.pihakKedua) {
      Object.keys(updateData.pihakKedua).forEach((key) => {
        updateQuery[`pihakKedua.${key}`] = updateData.pihakKedua[key];
      });
    }

    // Update properties
    if (updateData.properties) {
      Object.keys(updateData.properties).forEach((key) => {
        updateQuery[`properties.${key}`] = updateData.properties[key];
      });
    }

    const updated = await PKS.findByIdAndUpdate(
      pks._id,
      { $set: updateQuery },
      { new: true, runValidators: true }
    );

    res.json({ message: "PKS updated successfully", data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// SUBMIT FOR REVIEW (PUBLIC)
export const submitForReview = async (req, res) => {
  try {
    const { nomor } = req.params;
    const pks = await findPKSByNomor(nomor);

    if (!pks) {
      return res
        .status(404)
        .json({ message: "PKS not found with nomor: " + nomor });
    }

    // Validasi: Hanya bisa di-submit jika statusnya "menunggu dokumen"
    if (pks.properties.status !== "menunggu dokumen") {
      return res.status(400).json({
        message: `Cannot submit for review. Current status is '${pks.properties.status}'.`,
      });
    }

    pks.properties.status = "menunggu review";
    const updatedPks = await pks.save();

    res.json({
      message: "PKS successfully submitted for review.",
      data: updatedPks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE by NOMOR
export const deletePKSByNomor = async (req, res) => {
  try {
    const { nomor } = req.params;

    const pks = await findPKSByNomor(nomor);
    if (!pks) {
      return res
        .status(404)
        .json({ message: "PKS not found with nomor: " + nomor });
    }

    // Hapus file jika ada
    if (pks.fileUpload.fileName) {
      await deleteFileFromServer(pks.fileUpload.fileName);
    }

    await PKS.findByIdAndDelete(pks._id);

    res.json({
      message: "PKS and associated file deleted successfully",
      nomor: nomor,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== READ BY ID ====================

// READ ONE by ID
export const getPKSById = async (req, res) => {
  try {
    const pks = await PKS.findById(req.params.id);
    if (!pks) return res.status(404).json({ message: "PKS not found" });

    res.json(pks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE by ID
export const updatePKS = async (req, res) => {
  try {
    const updateData = req.body;

    const updated = await PKS.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "PKS not found" });
    }

    res.json({ message: "PKS updated successfully", data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE by ID
export const deletePKS = async (req, res) => {
  try {
    const deleted = await PKS.findById(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "PKS not found" });
    }

    // Hapus file jika ada
    if (deleted.fileUpload.fileName) {
      await deleteFileFromServer(deleted.fileUpload.fileName);
    }

    await PKS.findByIdAndDelete(req.params.id);

    res.json({
      message: "PKS and associated file deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
