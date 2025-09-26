import { Router } from "express";
const pksRouter = Router();

import {
  createPKS,
  getAllPKS,
  getPKSByNomor,
  updatePKSByNomor,
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

import upload from "../middleware/upload.middleware.js";

// ==================== PKS CRUD ====================

// CREATE - Buat PKS baru
pksRouter.post("/", createPKS);

// READ - Ambil semua PKS (dengan filter & pagination)
pksRouter.get("/", getAllPKS);

// ==================== PKS BY NOMOR (DEFAULT) ====================

// READ - Detail PKS by Nomor
pksRouter.get("/:nomor", getPKSByNomor);

// UPDATE - Update PKS by Nomor
pksRouter.patch("/:nomor", updatePKSByNomor);

// DELETE - Hapus PKS by Nomor
pksRouter.delete("/:nomor", deletePKSByNomor);

// ==================== FILE OPERATIONS BY NOMOR (DEFAULT) ====================

// UPLOAD/REPLACE - Upload file by Nomor
pksRouter.post("/:nomor/file", upload.single("file"), uploadFile);

// DOWNLOAD - Download file by Nomor
pksRouter.get("/:nomor/file", downloadFile);

// DELETE - Hapus file by Nomor
pksRouter.delete("/:nomor/file", deleteFile);

// ==================== PKS BY ID ====================

// READ - Detail PKS by ID
pksRouter.get("/byid/:id", getPKSById);

// UPDATE - Update PKS by ID
pksRouter.patch("/byid/:id", updatePKS);

// DELETE - Hapus PKS by ID
pksRouter.delete("/byid/:id", deletePKS);

// ==================== FILE OPERATIONS BY ID ====================

// UPLOAD/REPLACE - Upload file by ID
pksRouter.post("/byid/:id/file", upload.single("file"), uploadFileById);

// DOWNLOAD - Download file by ID
pksRouter.get("/byid/:id/file", downloadFileById);

// DELETE - Hapus file by ID
pksRouter.delete("/byid/:id/file", deleteFileById);

export default pksRouter;
