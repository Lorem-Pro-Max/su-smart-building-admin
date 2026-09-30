import express from "express";
import * as ElectricityController from "../controllers/electricityController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/usage/daily", protectAction,ElectricityController.getDailyUsage);
router.get("/usage/hourly",protectAction,ElectricityController.getHourlyUsage);
router.get("/usage/metadata", protectAction, ElectricityController.getMetadata);

export default router;
