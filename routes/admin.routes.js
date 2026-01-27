// routes/admin.routes.js
import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  setActiveYear,
  getActiveYear,
  setLastSequence,
  getLastSequence,
  generatePksNumber,
} from "../controllers/admin.controller.js";

const adminRouter = Router();

// Semua route ini harus diproteksi (Admin Only)
adminRouter.use(protect);

// Konfigurasi Tahun
adminRouter.post("/config/year", setActiveYear);
adminRouter.get("/config/year", getActiveYear);

// Konfigurasi Sequence (Reset/Set)
adminRouter.post("/config/sequence", setLastSequence);
adminRouter.get("/config/sequence", getLastSequence);

// Generate Nomor (Standalone Endpoint)
adminRouter.get("/generate-number", generatePksNumber);

export default adminRouter;
