import express from "express";
import * as ExhaustFanController from "../controllers/exhaustFanController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/status", ExhaustFanController.getExhaustFansStatus);
router.post("/batch-control", protectAction, ExhaustFanController.exhaustFansBatchControl);

export default router;
