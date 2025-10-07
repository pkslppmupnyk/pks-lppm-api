import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

// Middleware untuk protect route (hanya admin yang login)
export const protect = async (req, res, next) => {
  try {
    let token;

    // Cek token dari header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Cek apakah token ada
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak ditemukan",
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cari admin berdasarkan id dari token
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin tidak ditemukan",
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Akun tidak aktif",
      });
    }

    // Simpan data admin ke request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Gagal memverifikasi token",
      error: error.message,
    });
  }
};

// Middleware untuk route yang bisa diakses tanpa login (optional auth)
// Jika ada token valid, set req.admin, jika tidak ada/invalid, lanjut tanpa error
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id);

      if (admin && admin.isActive) {
        req.admin = admin;
      }
    }

    next();
  } catch (error) {
    // Jika ada error, abaikan dan lanjutkan tanpa set req.admin
    next();
  }
};
