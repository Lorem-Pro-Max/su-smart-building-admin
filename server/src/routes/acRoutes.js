import express from "express";
import * as AcController from "../controllers/acController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/status", protectAction, AcController.getAcStatus);
router.post("/batch-control", protectAction, AcController.acBatchControl);
router.post("/temp-control", protectAction, AcController.acTempAdjust)

export default router;
