import PKS from "../models/pks.model.js";
import DocNumber from "../models/numbering.model.js"; // untuk auto-number

// CREATE
export const createPKS = async (req, res) => {
    try {
        // generate nomor dokumen unik
        const seq = await DocNumber.getNextSeq("PKS");
        const nomor = `PKS-${new Date().getFullYear()}-${String(seq).padStart(
            4,
            "0"
        )}`;

        const pks = new PKS({
            ...req.body,
            content: {
                ...req.body.content,
                nomor,
            },
        });

        const saved = await pks.save();
        res.status(201).json({ message: "PKS created successfully", data: saved });
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

// UPDATE (partial update dengan PATCH)
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

// DELETE
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
