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

const MAX_PURPOSE_LENGTH = 500;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/* booking ทั้งวัน สำหรับหน้าสร้างการจอง */
export const getBookingsOnDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!DATE_PATTERN.test(date ?? "")) {
      return res.status(400).json({
        error: "date ต้องอยู่ในรูปแบบ YYYY-MM-DD",
      });
    }

    const data = await bookingService.getBookingsOnDate(date);

    return res.json({ date, count: data.length, data });
  } catch (error) {
    console.error("[Booking] Get bookings on date error:", error);

    return res.status(500).json({
      error: error.message || "Failed to fetch bookings",
    });
  }
};

export const createBooking = async (req, res) => {
  try {
    const {
      meeting_name,
      room_id,
      phone,
      booking_date,
      start_dateTime,
      end_dateTime,
      booking_type_id,
      purpose,
    } = req.body;

    const meetingName = meeting_name?.trim();
    if (!meetingName) {
      return res.status(400).json({ error: "กรุณาระบุหัวข้อการจอง" });
    }

    const roomId = Number(room_id);
    if (!Number.isInteger(roomId) || roomId <= 0) {
      return res.status(400).json({ error: "room_id ไม่ถูกต้อง" });
    }

    const bookingTypeId = Number(booking_type_id);
    if (!Number.isInteger(bookingTypeId) || bookingTypeId <= 0) {
      return res.status(400).json({ error: "booking_type_id ไม่ถูกต้อง" });
    }

    const startAt = new Date(start_dateTime);
    const endAt = new Date(end_dateTime);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      return res.status(400).json({
        error: "start_dateTime และ end_dateTime ต้องเป็นวันเวลาที่ถูกต้อง",
      });
    }

    if (startAt >= endAt) {
      return res.status(400).json({ error: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม" });
    }

    const trimmedPurpose = purpose?.trim() || null;
    if (trimmedPurpose && trimmedPurpose.length > MAX_PURPOSE_LENGTH) {
      return res.status(400).json({
        error: `เหตุผลการจองต้องไม่เกิน ${MAX_PURPOSE_LENGTH} ตัวอักษร`,
      });
    }

    const bookingDate = DATE_PATTERN.test(booking_date ?? "")
      ? booking_date
      : startAt.toISOString().slice(0, 10);

    const booking = await bookingService.createApprovedBooking({
      meetingName,
      roomId,
      requesterId: req.user.id,
      phone: phone || null,
      bookingDate,
      startDateTime: start_dateTime,
      endDateTime: end_dateTime,
      bookingTypeId,
      purpose: trimmedPurpose,
      actionBy: req.user.id,
    });

    if (!booking) {
      return res.status(409).json({
        error: "ช่วงเวลาที่เลือกถูกจองแล้ว กรุณาเลือกเวลาอื่นหรือเปลี่ยนห้อง",
      });
    }

    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error("[Booking] Create booking error:", error);

    return res.status(500).json({
      error: error.message || "Failed to create booking",
    });
  }
};
