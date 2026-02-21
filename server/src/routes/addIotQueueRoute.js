import express from "express";
import { protectAction } from "../middlewares/auth.js";
import * as IotQueueController from "../controllers/iotQueueController.js"

const router = express.Router();

router.post("/iot/add-queue", protectAction, IotQueueController.AddIotQueue);

export default router;
