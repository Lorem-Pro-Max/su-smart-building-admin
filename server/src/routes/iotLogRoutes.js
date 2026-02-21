import express from "express";
import { protectAction } from "../middlewares/auth.js";
import * as IotLogController from "../controllers/iotLogController.js";

const router = express.Router();

router.get("/", protectAction, IotLogController.GetIotLogs);

export default router;
