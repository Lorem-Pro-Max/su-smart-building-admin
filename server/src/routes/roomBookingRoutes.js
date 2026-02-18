import { Router } from "express";
import * as bookingController from "../controllers/bookingController.js";

const router = Router();

router.get("/bookings", bookingController.getBookings.bind(bookingController));

router.get(
  "/bookings/:id",
  bookingController.getBookingById.bind(bookingController),
);

router.patch(
  "/bookings/:id/status",
  bookingController.updateStatus.bind(bookingController),
);
export default router;
