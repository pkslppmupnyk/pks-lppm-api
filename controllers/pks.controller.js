import PKS from "../models/pks.model.js";
import DocNumber from "../models/numbering.model.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
export const createPKS = async (req, res) => {
  try {
    // 1. Buat instance PKS baru dengan nomor sementara untuk validasi
    const pksTemp = new PKS({
      ...req.body,
      content: {
        ...req.body.content,
        nomor: "TEMP",
      },
    });

    // 2. Trigger validasi Mongoose tanpa menyimpan ke DB
    await pksTemp.validate();

    // 3. Jika valid, generate nomor PKS yang sebenarnya
    const seq = await DocNumber.getNextSeq("PKS");
    const year = new Date().getFullYear();
    const cakupan =
      pksTemp.properties.cakupanKerjaSama === "luar negeri"
        ? "KS.00.01"
        : "KS.00.00";
    const nomor = `${seq}/UN62.21/${cakupan}/${year}`;

    // 4. Tetapkan nomor yang benar
    pksTemp.content.nomor = nomor;

    // 5. Simpan dokumen ke database
    const saved = await pksTemp.save();

    res.status(201).json({
      message: "PKS created successfully",
      data: saved,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ ALL (dengan filter dan paginasi)
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

export const updatePKS = async (req, res) => {
  try {
    const pks = await PKS.findById(req.params.id);
    if (!pks) {
      return res.status(404).json({ message: "PKS not found" });
    }

    const updateData = req.body;

    // Cek jika cakupan kerja sama diubah
    if (
      updateData.properties &&
      updateData.properties.cakupanKerjaSama &&
      updateData.properties.cakupanKerjaSama !== pks.properties.cakupanKerjaSama
    ) {
      // Regenerasi nomor jika cakupan berubah
      const currentNomorParts = pks.content.nomor.split("/");
      const seq = currentNomorParts[0];
      const year = currentNomorParts[3];
      const newCakupanCode =
        updateData.properties.cakupanKerjaSama === "luar negeri"
          ? "KS.00.01"
          : "KS.00.00";

      const newNomor = `${seq}/UN62.21/${newCakupanCode}/${year}`;

      if (!updateData.content) {
        updateData.content = {};
      }
      updateData.content.nomor = newNomor;
    } else if (updateData.content && updateData.content.nomor) {
      // Cegah perubahan nomor manual jika cakupan tidak berubah
      delete updateData.content.nomor;
    }

    const updated = await PKS.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({ message: "PKS updated successfully", data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// SUBMIT FOR REVIEW by ID
export const submitForReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const pks = await PKS.findById(id);

    if (!pks) {
      return res.status(404).json({ message: "PKS not found" });
    }

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

// DELETE by ID
export const deletePKS = async (req, res) => {
  try {
    const deleted = await PKS.findById(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "PKS not found" });
    }

    // Hapus file terkait jika ada
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
