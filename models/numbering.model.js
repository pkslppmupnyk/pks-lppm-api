import mongoose from "mongoose";

const docNumberSchema = new mongoose.Schema(
    {
        _id: {
            // nama sequence (misalnya: "PKS", "SK", dll.)
            type: String,
            required: true,
        },
        seq: {
            // nomor terakhir
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, // otomatis bikin createdAt & updatedAt
    }
);

// Helper static method untuk increment nomor
docNumberSchema.statics.getNextSeq = async function (name) {
    const counter = await this.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // upsert = bikin baru kalau belum ada
    );
    return counter.seq;
};

const DocNumber = mongoose.model("DocNumber", docNumberSchema, "DocNumber");

export default DocNumber;
