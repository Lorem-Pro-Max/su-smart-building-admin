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

router.post(
  "/bookings",
  protectAction,
  bookingController.createBooking.bind(bookingController),
);

router.post(
  "/bookings/bulk",
  protectAction,
  bookingController.createBookingsBulk.bind(bookingController),
);

router.get(
  "/bookings/date/:date",
  protectAction,
  bookingController.getBookingsOnDate.bind(bookingController),
);

/* ต้องอยู่เหนือ /bookings/:id ไม่งั้น Express จับเป็น :id="range" */
router.get(
  "/bookings/range",
  protectAction,
  bookingController.getBookingsInRange.bind(bookingController),
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

router.delete(
  "/bookings",
  protectAction,
  bookingController.deleteBookings.bind(bookingController),
);

export default router;
