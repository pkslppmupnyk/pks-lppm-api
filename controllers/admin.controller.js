// controllers/admin.controller.js
import DocNumber from "../models/numbering.model.js";
import Config from "../models/config.model.js";

// --- KELOLA TAHUN AKTIF ---

// Set Tahun Aktif di Database
export const setActiveYear = async (req, res) => {
  try {
    const { year } = req.body;
    if (!year) return res.status(400).json({ message: "Year is required" });

    const config = await Config.findOneAndUpdate(
      { key: "pks_active_year" },
      {
        value: year,
        description: "Tahun aktif untuk penomoran PKS",
      },
      { new: true, upsert: true }, // Buat baru jika belum ada
    );

    res.json({ message: "Active year updated", data: config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Tahun Aktif
export const getActiveYear = async (req, res) => {
  try {
    let config = await Config.findOne({ key: "pks_active_year" });

    // Default ke tahun sekarang jika belum diset di DB
    const currentYear = config ? config.value : new Date().getFullYear();

    res.json({ year: currentYear });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- KELOLA SEQUENCE (URUTAN NOMOR) ---

// Set/Reset Nomor Urut Terakhir
export const setLastSequence = async (req, res) => {
  try {
    const { seq } = req.body; // Misal admin ingin set ke 0 atau 100

    if (seq === undefined || seq === null) {
      return res
        .status(400)
        .json({ message: "Sequence number (seq) is required" });
    }

    const docNumber = await DocNumber.findOneAndUpdate(
      { _id: "PKS" },
      { seq: Number(seq) },
      { new: true, upsert: true },
    );

    res.json({ message: "Sequence updated successfully", data: docNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- FUNGSI GENERATOR NOMOR (TERPISAH) ---

// Generate Nomor Baru (Tanpa save ke PKS, hanya preview/reserve)
export const generatePksNumber = async (req, res) => {
  try {
    const { cakupan } = req.query; // 'luar negeri' atau 'dalam negeri'

    // 1. Ambil Tahun dari Config DB (Bukan new Date)
    let yearConfig = await Config.findOne({ key: "pks_active_year" });
    const year = yearConfig ? yearConfig.value : new Date().getFullYear();

    // 2. Ambil Sequence (Increment)
    const counter = await DocNumber.findOneAndUpdate(
      { _id: "PKS" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    // 3. Tentukan Kode Cakupan
    const cakupanCode = cakupan === "luar negeri" ? "KS.00.01" : "KS.00.00";

    // 4. Format Nomor
    const nomor = `${counter.seq}/UN62.21/${cakupanCode}/${year}`;

    res.json({
      message: "Number generated successfully",
      nomor: nomor,
      components: {
        seq: counter.seq,
        year: year,
        cakupan: cakupanCode,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
