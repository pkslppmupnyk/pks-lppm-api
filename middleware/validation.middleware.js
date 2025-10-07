import { body, validationResult } from "express-validator";

// Middleware untuk check validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation rules untuk register
export const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username minimal 3 karakter")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username hanya boleh mengandung huruf, angka, dan underscore"
    ),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email tidak valid")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
  body("nama").trim().notEmpty().withMessage("Nama harus diisi"),
];

// Validation rules untuk login
export const loginValidation = [
  body("username").trim().notEmpty().withMessage("Username harus diisi"),
  body("password").notEmpty().withMessage("Password harus diisi"),
];
