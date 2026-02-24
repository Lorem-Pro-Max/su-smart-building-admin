import express from "express";
import { login } from "../controllers/authController.js";
import { logout } from "../controllers/authController.js";
import { refreshToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refreshToken);

export default router;
