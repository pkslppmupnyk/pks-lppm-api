// pkslppmupnyk/pks-lppm-api/pks-lppm-api-cdbb3090bc26c697114ce7081d0e9d3e3badd715/controllers/logo.controller.js
import PKS from "../models/pks.model.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// UPLOAD ATAU TIMPA LOGO BERDASARKAN ID
export const uploadLogoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pks = await PKS.findById(id);

    if (!pks) {
      if (req.file) await fs.unlink(req.file.path);
      return res.status(404).json({ message: "PKS not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No logo file uploaded" });
    }

    // Update database dengan nama file logo baru
    pks.logoUpload.fileName = req.file.filename;
    await pks.save();

    res.status(200).json({
      message: "Logo uploaded successfully",
      data: {
        fileName: pks.logoUpload.fileName,
      },
    });
  } catch (err) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error("Error cleaning up failed logo upload:", unlinkErr);
      }
    }
    res.status(500).json({ error: err.message });
  }
};

// HAPUS LOGO BERDASARKAN ID
export const deleteLogoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pks = await PKS.findById(id);

    if (!pks) {
      return res.status(404).json({ message: "PKS not found" });
    }

    if (!pks.logoUpload?.fileName) {
      return res.status(404).json({ message: "No logo to delete" });
    }

    // Hapus file dari folder uploads/logos
    const filePath = path.join(
      __dirname,
      "../uploads/logos",
      pks.logoUpload.fileName
    );
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.log("Logo not found on server, clearing database record anyway.");
    }

    // Hapus info logo dari database
    pks.logoUpload.fileName = "";
    await pks.save();

    res.status(200).json({
      message: "Logo deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
