import mongoose from "mongoose";

// regex email valid
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// skema struktur database
const pksSchema = new mongoose.Schema(
  {
    content: {
      nomor: {
        type: String,
        unique: true,
        immutable: true,
      },
      judul: {
        type: String,
        required: [true, "Judul perjanjian is required"],
        trim: true,
      },
      tanggal: {
        type: Date,
        required: [true, "Tanggal is required"],
      },
      tanggalKadaluarsa: {
        type: Date,
        // Removed index: true to avoid duplicate with schema.index() below
      },
    },

    pihakKedua: {
      instansi: {
        type: String,
        required: [true, "Instansi is required"],
        trim: true,
      },
      nama: {
        type: String,
        required: [true, "Nama is required"],
        trim: true,
      },
      jabatan: {
        type: String,
        required: [true, "Jabatan is required"],
        trim: true,
      },
      alamat: {
        type: String,
        required: [true, "Alamat is required"],
        trim: true,
      },
      nomor: {
        type: String,
        trim: true,
      },
    },

    properties: {
      uploadDate: {
        type: Date,
        default: Date.now,
        index: true,
      },
      status: {
        type: String,
        enum: [
          "draft",
          "menunggu dokumen",
          "menunggu review",
          "approved",
          "rejected",
        ],
        default: "draft",
        index: true,
      },
      comment: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        required: [true, "email is required"],
        trim: true,
        lowercase: true,
        match: [emailRegex, "Format email tidak valid"],
        index: true,
      },
      reminderDate: {
        type: Date,
        index: true,
      },
      notificationsSent: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastNotificationDate: {
        type: Date,
      },
      isReminderActive: {
        type: Boolean,
        default: true,
      },
    },

    fileUpload: {
      docName: {
        // nama asli file (misalnya: "PKS_ABC.pdf")
        type: String,
        trim: true,
        default: "",
      },
      fileName: {
        // nama file di server (misalnya: "1734567890.pdf")
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index compound
pksSchema.index({ "properties.status": 1, "properties.uploadDate": -1 });
pksSchema.index({
  "properties.reminderDate": 1,
  "properties.isReminderActive": 1,
});
pksSchema.index({ "content.tanggalKadaluarsa": 1 });

const PKS = mongoose.model("PKS", pksSchema, "perjanjian-kerja-sama");

export default PKS;
