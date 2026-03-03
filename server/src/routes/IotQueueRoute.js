import express from "express";
import { protectAction } from "../middlewares/auth.js";
import * as IotQueueController from "../controllers/iotQueueController.js";

const router = express.Router();

router.post("/add-queue", protectAction, IotQueueController.AddIotQueue);
router.post("/set-active-room", protectAction, IotQueueController.SetActiveRoom);

export default router;
