import express from "express";
import * as DoorController from "../controllers/doorController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/status", DoorController.getDoorsStatus);
router.post("/batch-control", protectAction, DoorController.batchControl);
router.post("/control-all", protectAction, DoorController.controlAll);

export default router;
