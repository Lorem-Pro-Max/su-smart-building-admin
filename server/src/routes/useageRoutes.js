import express from "express";
import * as UsageController from "../controllers/useageController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:type/all", protectAction, UsageController.GetAllUsageStats);

export default router;
