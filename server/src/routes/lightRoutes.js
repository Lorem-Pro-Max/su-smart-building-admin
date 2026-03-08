import express from "express";
import * as LightController from "../controllers/lightController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/status", protectAction, LightController.getLightsStatus);
router.post(
  "/batch-control",
  protectAction,
  LightController.lightsBatchControl,
);

export default router;
