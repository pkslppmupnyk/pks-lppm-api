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
    // Langsung simpan data tanpa generate nomor
    // Nomor akan default "" sesuai model, atau bisa diset "-"
    const newPks = new PKS({
      ...req.body,
      content: {
        ...req.body.content,
        nomor: "", // Kosongkan dulu
      },
      properties: {
        ...req.body.properties,
        status: "draft", // Paksa status awal jadi draft
      },
    });

    const saved = await newPks.save();

    res.status(201).json({
      message: "PKS draft created successfully",
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
    const { id } = req.params;
    const updateData = req.body;

    // Ambil data PKS existing
    const existingPks = await PKS.findById(id);
    if (!existingPks) {
      return res.status(404).json({ message: "PKS not found" });
    }

    // --- VARIABEL KUNCI MITIGASI ---
    // Cek apakah PKS ini sudah memiliki nomor yang valid
    const alreadyHasNumber =
      existingPks.content?.nomor &&
      existingPks.content.nomor !== "" &&
      existingPks.content.nomor !== "-" &&
      existingPks.content.nomor !== "TEMP"; // Jaga-jaga jika ada sisa data lama

    // --- MITIGASI 1: Cegah Input Manual/Paksa Nomor ---
    // Jika nomor sudah ada, hapus field 'nomor' dari request body agar tidak tertimpa
    if (alreadyHasNumber) {
      if (updateData.content && updateData.content.nomor) {
        delete updateData.content.nomor;
      }
    }

    // --- MITIGASI 2: Logic Generasi Nomor ---
    // Hanya generate jika: Status jadi 'approved' DAN belum punya nomor
    if (
      updateData.properties?.status === "menunggu fokumen" &&
      !alreadyHasNumber // <--- PENAHAN UTAMA: Lewati jika sudah ada nomor
    ) {
      // 1. Ambil Tahun (dari Config atau Date)
      let yearConfig = await Config.findOne({ key: "pks_active_year" });
      const year = yearConfig ? yearConfig.value : new Date().getFullYear();

      // 2. Ambil Sequence Baru
      const seqData = await DocNumber.findOneAndUpdate(
        { _id: "PKS" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );

      // 3. Tentukan Kode Cakupan
      const cakupanVal =
        updateData.properties?.cakupanKerjaSama ||
        existingPks.properties.cakupanKerjaSama;
      const cakupanCode =
        cakupanVal === "luar negeri" ? "KS.00.01" : "KS.00.00";

      // 4. Format Nomor
      const generatedNomor = `${seqData.seq}/UN62.21/${cakupanCode}/${year}`;

      // 5. Masukkan ke object update
      if (!updateData.content) updateData.content = {};
      updateData.content.nomor = generatedNomor;
    }

    // --- MITIGASI 3: Hapus/Modifikasi Logika Regenerasi Lama ---
    // Kode asli Anda memiliki logika: jika cakupan berubah, nomor berubah.
    // Kita ubah agar logika itu HANYA jalan jika nomor BELUM ada.
    if (
      updateData.properties?.cakupanKerjaSama &&
      updateData.properties.cakupanKerjaSama !==
        existingPks.properties.cakupanKerjaSama &&
      !alreadyHasNumber // <--- TAMBAHAN PENTING: Jangan ubah nomor jika sudah ada
    ) {
      // Jika status draft/belum ada nomor, dan user ganti cakupan,
      // kita tidak perlu generate nomor baru disini, karena nomor akan digenerate saat 'approved'.
      // Jadi blok ini bisa dikosongkan atau dihapus untuk flow baru ini.
    }

    // Lakukan Update ke Database
    const updated = await PKS.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    res.json({
      message: "PKS updated successfully",
      data: updated,
      generatedNumber: updateData.content?.nomor || null,
    });
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
