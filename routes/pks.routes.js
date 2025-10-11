import { Router } from "express";
const pksRouter = Router();

// Import controllers
import {
  createPKS,
  getAllPKS,
  getPKSById,
  updatePKS,
  deletePKS,
  submitForReviewById,
} from "../controllers/pks.controller.js";

import {
  uploadFileById,
  downloadFileById,
  deleteFileById,
} from "../controllers/file.controller.js";

import {
  startReminder,
  stopReminder,
  triggerStatusNotificationById,
} from "../controllers/email.controller.js";

// Mengimpor dengan nama yang benar
import { generatePKSDocumentById } from "../controllers/document.controller.js";
import upload from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

// === PKS CRUD (berbasis ID) ===
pksRouter.post("/", createPKS);
pksRouter.get("/", getAllPKS);
pksRouter.get("/:id", getPKSById);
pksRouter.patch("/:id", protect, updatePKS);
pksRouter.delete("/:id", protect, deletePKS);

// === Operasi Lainnya (berbasis ID) ===
pksRouter.post("/:id/submit-review", submitForReviewById);
pksRouter.get("/:id/generate", generatePKSDocumentById);
pksRouter.post(
  "/:id/status-notification",
  protect,
  triggerStatusNotificationById
);

// === Operasi File (berbasis ID) ===
pksRouter.post("/:id/file", upload.single("file"), uploadFileById);
pksRouter.get("/:id/file", downloadFileById);
pksRouter.delete("/:id/file", protect, deleteFileById);

// === Operasi Reminder (sudah berbasis ID) ===
pksRouter.post("/:id/reminders/start", startReminder);
pksRouter.post("/:id/reminders/stop", stopReminder);

export default pksRouter;
