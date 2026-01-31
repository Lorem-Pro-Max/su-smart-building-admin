import express from "express";
import * as LightController from "../controllers/lightController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/status", LightController.getLightsStatus);
router.post("/batch-control", protectAction, LightController.batchControl);
router.post("/control-all", protectAction, LightController.controlAll);

export default router;
