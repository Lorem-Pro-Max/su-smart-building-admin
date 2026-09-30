import express from "express";
import * as ReportController from "../controllers/reportController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:type", protectAction, ReportController.downloadReport);

export default router;
