import express from "express";
import * as AcController from "../controllers/acController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/status", AcController.getAcStatus);
router.post("/batch-control", protectAction, AcController.batchControl);
router.post("/control-all", protectAction, AcController.controlAll);

export default router;
