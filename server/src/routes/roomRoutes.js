import express from "express";
import * as roomController from "../controllers/roomController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/by-floor",
  protectAction,
  roomController.getClassroomRoomsByFloor.bind(roomController),
);

router.patch(
  "/:id",
  protectAction,
  roomController.patchRoomTitle.bind(roomController),
);

export default router;
