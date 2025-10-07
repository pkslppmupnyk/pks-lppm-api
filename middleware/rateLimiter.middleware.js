import rateLimit from "express-rate-limit";

// Rate limiter untuk auth routes (login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // max 5 request per 15 menit
  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk API umum
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // max 100 request per 15 menit
  message: {
    success: false,
    message: "Terlalu banyak request. Coba lagi nanti",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
