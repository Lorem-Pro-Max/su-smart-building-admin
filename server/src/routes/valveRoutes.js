import express from "express";
import * as ValveController from "../controllers/valveController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/status", ValveController.getValvesStatus);
router.post("/batch-control", protectAction, ValveController.ValvesBatchControl);
router.get("/usage/daily", ValveController.getDailyUsage);
router.get("/usage/hourly", ValveController.getHourlyUsage);
router.get("/usage/metadata", ValveController.getMetadata)

export default router;
