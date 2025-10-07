import { Router } from "express";
const authRouter = Router();

import {
  register,
  login,
  getMe,
  logout,
  changePassword,
} from "../controllers/auth.controller.js";

import {
  registerValidation,
  loginValidation,
  validate,
} from "../middleware/validation.middleware.js";

import { protect } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

// Public routes
authRouter.post(
  "/register",
  authLimiter,
  registerValidation,
  validate,
  register
);
authRouter.post("/login", authLimiter, loginValidation, validate, login);

// Protected routes (hanya admin yang login)
authRouter.get("/me", protect, getMe);
authRouter.post("/logout", protect, logout);

// Protected route untuk ganti password
authRouter.patch("/change-password", protect, changePassword);

export default authRouter;
