import { Router } from "express";
import * as bookingController from "../controllers/bookingController.js";
import { protectAction } from "../middlewares/auth.js";

const router = Router();

router.get(
  "/bookings",
  protectAction,
  bookingController.getBookings.bind(bookingController),
);

router.get(
  "/bookings/filters",
  protectAction,
  bookingController.getApproveBookingFilters.bind(bookingController),
);

router.get(
  "/bookings/:id",
  protectAction,
  bookingController.getBookingById.bind(bookingController),
);

router.patch(
  "/bookings/:id/status",
  protectAction,
  bookingController.updateStatus.bind(bookingController),
);
export default router;
