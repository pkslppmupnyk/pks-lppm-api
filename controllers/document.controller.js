// controllers/document.controller.js
import { generateDocument } from "../services/documentGenerator.service.js";
import PKS from "../models/pks.model.js";

/**
 * Controller untuk generate dokumen PKS (.docx) berdasarkan ID
 * Endpoint: /api/pks/:id/generate
 */
export const generatePKSDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari data PKS berdasarkan ID
    const pks = await PKS.findById(id);
    if (!pks) {
      return res.status(404).json({ message: "PKS not found with id: " + id });
    }

    // Panggil service pembuat dokumen
    const buffer = await generateDocument(pks);

    // Nama file hasil generate (menggunakan nomor PKS agar lebih deskriptif)
    const filename = `${pks.content.nomor.replace(/\//g, "-")}.docx`;

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
