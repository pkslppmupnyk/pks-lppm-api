// controllers/document.controller.js
import { generateDocument } from "../services/documentGenerator.service.js";
import PKS from "../models/pks.model.js";

/**
 * Controller untuk generate dokumen PKS (.docx)
 * Endpoint: /api/pks/:nomor/generate
 */
export const generatePKSDocument = async (req, res) => {
  try {
    const { nomor } = req.params;

    // Cari data PKS berdasarkan nomor
    const pks = await PKS.findOne({ "content.nomor": nomor });
    if (!pks) {
      return res
        .status(404)
        .json({ message: "PKS not found with nomor: " + nomor });
    }

    // Panggil service pembuat dokumen
    const buffer = await generateDocument(pks);

    // Nama file hasil generate
    const filename = `${pks.content.nomor}.docx`;

    // Header agar bisa di-download langsung
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error("Error generating document:", err);
    res.status(500).json({ error: err.message });
  }
};
