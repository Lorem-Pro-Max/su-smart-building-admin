import { bookingService } from "../services/bookingService.js";

const toArray = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return String(value).split(",");
};

export const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, bookingTypes, floors, statuses } = req.query;

    const result = await bookingService.getAllBookings({
      page: Number(page),
      limit: Number(limit),
      bookingTypes: toArray(bookingTypes).map(Number).filter(Number.isFinite),
      floors: toArray(floors).map(Number).filter(Number.isFinite),
      statuses: toArray(statuses),
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("[Booking] Get bookings error:", error);

    return res.status(500).json({
      message: "Failed to fetch bookings",
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

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: booking,
    });
  } catch (error) {
    console.error("[Booking] Get booking error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch booking",
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status, reason = "" } = req.body;

    const rawCancelIds =
      req.body.cancelIds ?? (req.body.cancelId ? [req.body.cancelId] : []);

    const cancelIds = Array.isArray(rawCancelIds)
      ? rawCancelIds.map(Number).filter(Number.isFinite)
      : [];

    const actionBy = req.user?.id ?? req.user?.userId ?? req.userId;

    if (!actionBy) {
      return res.status(401).json({
        success: false,
        message: "User information not found",
      });
    }

    const result = await bookingService.updateStatus(
      Number(id),

      status,

      reason,

      cancelIds,

      actionBy,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[Booking] Update status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Update failed",
    });
  }
};

export const getApproveBookingFilters = async (req, res) => {
  try {
    const filters = await bookingService.getApproveBookingFilters();

    return res.status(200).json(filters);
  } catch (error) {
    console.error("[Booking] Get approve booking filters error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get approve booking filters",
    });
  }
};

export const deleteBookings = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Booking ids are required",
      });
    }

    const result = await bookingService.deleteBookings(ids);

    return res.status(200).json({
      message: "Delete bookings successfully",
      ...result,
    });
  } catch (error) {
    console.error("[Booking] Delete bookings error:", error);

    return res.status(500).json({
      message: "Failed to delete bookings",
    });
  }
};
