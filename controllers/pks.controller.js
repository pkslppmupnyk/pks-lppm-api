import PKS from "../models/pks.model.js";
import DocNumber from "../models/numbering.model.js";

// Helper function untuk mencari PKS by nomor
const findPKSByNomor = async (nomor) => {
  const pks = await PKS.findOne({ "content.nomor": nomor });
  return pks;
};

// CREATE
export const createPKS = async (req, res) => {
  try {
    // 1. Validasi dulu tanpa nomor
    const pksTemp = new PKS({
      ...req.body,
      content: {
        ...req.body.content,
        nomor: "TEMP", // temporary value
      },
    });

    // 2. Trigger validasi tanpa save
    await pksTemp.validate();

    // 3. Jika validasi OK, baru generate nomor
    const seq = await DocNumber.getNextSeq("PKS");
    const nomor = `PKS-${new Date().getFullYear()}-${String(seq).padStart(
      4,
      "0"
    )}`;

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

    const updated = await PKS.findByIdAndUpdate(
      pks._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({ message: "PKS updated successfully", data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

    await PKS.findByIdAndDelete(pks._id);

    res.json({ message: "PKS deleted successfully", nomor: nomor });
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
    const deleted = await PKS.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "PKS not found" });
    }

    res.json({ message: "PKS deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
