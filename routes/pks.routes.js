// pkslppmupnyk/pks-lppm-api/pks-lppm-api-1299943cfbbfefe44c5b4085e404309d72f03997/routes/pks.routes.js

import { Router } from "express";
const pksRouter = Router();

// Import controllers
import {
  createPKS,
  getAllPKS,
  getPKSById,
  updatePKS,
  deletePKS,
  submitForReviewById, // Ganti nama fungsi ini
} from "../controllers/pks.controller.js";

import {
  uploadFileById,
  downloadFileById,
  deleteFileById,
} from "../controllers/file.controller.js";

import {
  startReminder,
  stopReminder,
  triggerStatusNotificationById, // Ganti nama fungsi ini
} from "../controllers/email.controller.js";

import { generatePKSDocumentById } from "../controllers/document.controller.js"; // Ganti nama fungsi ini
import upload from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

// === PKS CRUD (berbasis ID) ===
pksRouter.post("/", createPKS); // Tetap
pksRouter.get("/", getAllPKS); // Tetap
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
