import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register admin baru
// @route   POST /api/auth/register
// @access  Public (nanti bisa dibatasi)
export const register = async (req, res) => {
  try {
    const { username, email, password, nama } = req.body;

    // Validasi input
    if (!username || !email || !password || !nama) {
      return res.status(400).json({
        success: false,
        message: "Semua field harus diisi",
      });
    }

    // Cek apakah username atau email sudah ada
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Username atau email sudah terdaftar",
      });
    }

    // Buat admin baru
    const admin = await Admin.create({
      username,
      email,
      password,
      nama,
    });

    // Generate token
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: "Admin berhasil didaftarkan",
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        nama: admin.nama,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mendaftarkan admin",
      error: error.message,
    });
  }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password harus diisi",
      });
    }

    // Cari admin dan include password
    const admin = await Admin.findOne({ username }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    // Cek apakah admin aktif
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Akun tidak aktif",
      });
    }

    // Verifikasi password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    // Generate token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        nama: admin.nama,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal login",
      error: error.message,
    });
  }
};

// @desc    Get profile admin yang sedang login
// @route   GET /api/auth/me
// @access  Private (Admin only)
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        nama: admin.nama,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data profile",
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PATCH /api/auth/change-password
// @access  Private (Admin only)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password lama dan password baru harus diisi",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password baru minimal 6 karakter",
      });
    }

    // Ambil admin dengan password
    const admin = await Admin.findById(req.admin.id).select("+password");

    // Verifikasi password lama
    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password lama salah",
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengubah password",
      error: error.message,
    });
  }
};

// @desc    Logout admin
// @route   POST /api/auth/logout
// @access  Private (Admin only)
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout berhasil",
  });
};
