import express from "express";
import * as airQualityController from "../controllers/airQualityController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/sensor/metadata",
  protectAction,
  airQualityController.getAirQualityMetadata,
);

router.get(
  "/sensor/room/:id",
  protectAction,
  airQualityController.getAirQualityRoomData,
);

router.get(
  "/sensor/ranking",
  protectAction,
  airQualityController.getAirQualityByType,
);

export default router;
