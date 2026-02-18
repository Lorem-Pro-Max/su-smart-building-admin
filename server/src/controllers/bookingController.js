import { bookingService } from "../services/bookingService.js";

export const getBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await bookingService.getBookingWithDuplicate(Number(id));

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch booking",
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, cancelId = null } = req.body;

    const result = await bookingService.updateStatus(
      Number(id),
      status,
      reason,
      cancelId,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Update failed",
    });
  }
};
