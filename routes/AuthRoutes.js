import { verifyEmail } from "../controllers/Authentication/userActivation.js";

import {
  register,
  login,
  refreshToken,
} from "../controllers/Authentication/auth.js";

import {
  forgotPassword,
  resetPassword,
} from "../controllers/Authentication/resetPasssword.js";

import isAuth from "../middleware/secure/isPermitted.js";

import express from "express";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/verify", verifyEmail);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword", resetPassword);
router.post("/refreshToken", refreshToken);
export default router;
