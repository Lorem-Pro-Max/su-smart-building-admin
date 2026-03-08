import express from "express";
import * as ValveController from "../controllers/valveController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/status", ValveController.getValvesStatus);
router.post(
  "/batch-control",
  protectAction,
  ValveController.ValvesBatchControl,
);
router.get("/usage/daily", protectAction, ValveController.getDailyUsage);
router.get("/usage/hourly", protectAction, ValveController.getHourlyUsage);
router.get("/usage/metadata", protectAction, ValveController.getMetadata);

export default router;
