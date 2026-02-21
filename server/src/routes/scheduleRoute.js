import express from "express";
import * as scheduleController from "../controllers/scheduleController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/iot-schedule",
  protectAction,
  scheduleController.getScheduleList.bind(scheduleController),
);

router.get(
  "/iot-schedule/booking",
  protectAction,
  scheduleController.getScheduleBooking.bind(scheduleController),
);
router.post(
  "/iot-schedule/bulk",
  protectAction,
  scheduleController.createSchedulesController.bind(scheduleController),
);

router.delete(
  "/iot-schedule/deletes",
  protectAction,
  scheduleController.deleteScheduleController.bind(scheduleController),
);

router.get(
  "/room-device/:id",
  protectAction,
  scheduleController.getRoomById.bind(scheduleController),
);

export default router;
