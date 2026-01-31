import express from "express";
import * as ElectricityController from "../controllers/electricityController.js";

const router = express.Router();

router.get("/usage/daily", ElectricityController.getDailyUsage);
router.get("/usage/hourly",ElectricityController.getHourlyUsage);
router.get("/usage/metadata", ElectricityController.getMetadata);

export default router;
