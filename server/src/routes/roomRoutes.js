import express from "express";
import * as roomController from "../controllers/roomController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/by-floor",
  protectAction,
  roomController.getClassroomRoomsByFloor.bind(roomController),
);

export default router;
