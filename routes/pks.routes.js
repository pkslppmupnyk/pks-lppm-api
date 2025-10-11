import { Router } from "express";
const pksRouter = Router();

import {
  createPKS,
  getAllPKS,
  getPKSByNomor,
  updatePKSByNomor,
  submitForReview,
  deletePKSByNomor,
  getPKSById,
  updatePKS,
  deletePKS,
} from "../controllers/pks.controller.js";

import {
  uploadFile,
  downloadFile,
  deleteFile,
  uploadFileById,
  downloadFileById,
  deleteFileById,
} from "../controllers/file.controller.js";

import {
  startReminder,
  stopReminder,
  sendStatusNotification,
} from "../controllers/email.controller.js";

import { generatePKSDocument } from "../controllers/document.controller.js";

import upload from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

// ==================== PKS CRUD ====================

// CREATE - Buat PKS baru (PUBLIC - siapa saja bisa)
pksRouter.post("/", createPKS);

// READ - Ambil semua PKS (PUBLIC - siapa saja bisa lihat)
pksRouter.get("/", getAllPKS);

// ==================== PKS BY NOMOR (DEFAULT) ====================

// READ - Detail PKS by Nomor (PUBLIC)
pksRouter.get("/:nomor", getPKSByNomor);

// SUBMIT FOR REVIEW - Ubah status dari 'menunggu dokumen' ke 'menunggu review' (PUBLIC)
pksRouter.post("/:nomor/submit-review", submitForReview);

// UPDATE - Update PKS by Nomor (ADMIN ONLY)
pksRouter.patch("/:nomor", protect, updatePKSByNomor);

// DELETE - Hapus PKS by Nomor (ADMIN ONLY)
pksRouter.delete("/:nomor", protect, deletePKSByNomor);

// ==================== FILE OPERATIONS BY NOMOR (DEFAULT) ====================

// UPLOAD/REPLACE - Upload file by Nomor (PUBLIC - siapa saja bisa upload)
pksRouter.post("/:nomor/file", upload.single("file"), uploadFile);

// DOWNLOAD - Download file by Nomor (PUBLIC)
pksRouter.get("/:nomor/file", downloadFile);

// DELETE - Hapus file by Nomor (ADMIN ONLY)
pksRouter.delete("/:nomor/file", protect, deleteFile);

// Generate dokumen (PUBLIC - siapa saja bisa generate/download)
pksRouter.get("/:nomor/generate", generatePKSDocument);

// ==================== PKS BY ID ====================

// READ - Detail PKS by ID (PUBLIC)
pksRouter.get("/byid/:id", getPKSById);

// UPDATE - Update PKS by ID (ADMIN ONLY)
pksRouter.patch("/byid/:id", protect, updatePKS);

// DELETE - Hapus PKS by ID (ADMIN ONLY)
pksRouter.delete("/byid/:id", protect, deletePKS);

// ==================== FILE OPERATIONS BY ID ====================

// UPLOAD/REPLACE - Upload file by ID (PUBLIC)
pksRouter.post("/byid/:id/file", upload.single("file"), uploadFileById);

// DOWNLOAD - Download file by ID (PUBLIC)
pksRouter.get("/byid/:id/file", downloadFileById);

// DELETE - Hapus file by ID (ADMIN ONLY)
pksRouter.delete("/byid/:id/file", protect, deleteFileById);

// ==================== EMAIL & REMINDER OPERATIONS (PUBLIC) ====================

// START Reminder by ID
pksRouter.post("/byid/:id/reminders/start", startReminder);

// STOP Reminder by ID
pksRouter.post("/byid/:id/reminders/stop", stopReminder);

// Send Status Change Notification by ID (ADMIN ONLY)
pksRouter.post(
  "/byid/:id/status-notification",
  protect,
  triggerStatusNotification
);
// --- DENGAN YANG DI BAWAH INI ---
// Send Status Change Notification by Nomor (ADMIN ONLY)
pksRouter.post("/:nomor/send-notification", protect, triggerStatusNotification);

export default pksRouter;
