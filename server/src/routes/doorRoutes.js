import express from "express";
import * as DoorController from "../controllers/doorController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/status", protectAction, DoorController.getDoorsStatus);
router.post("/batch-control", protectAction, DoorController.doorsBatchControl);

export default router;
