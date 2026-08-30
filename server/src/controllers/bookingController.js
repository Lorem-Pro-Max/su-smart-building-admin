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

const MAX_BULK_OCCURRENCES = 50;

/* ตรวจ field ที่ทุกใบใช้ร่วมกัน — เรียกจากทั้ง createBooking และ createBookingsBulk
   สกัดออกมาเพื่อการันตีเชิงโครงสร้างว่า validation ของสองเส้นทางเหมือนกันจริง ไม่ใช่ copy-paste */
function validateSharedBookingFields({
  meeting_name,
  room_id,
  booking_type_id,
  purpose,
}) {
  const meetingName = meeting_name?.trim();
  if (!meetingName) {
    return { error: "กรุณาระบุหัวข้อการจอง" };
  }

  const roomId = Number(room_id);
  if (!Number.isInteger(roomId) || roomId <= 0) {
    return { error: "room_id ไม่ถูกต้อง" };
  }

  const bookingTypeId = Number(booking_type_id);
  if (!Number.isInteger(bookingTypeId) || bookingTypeId <= 0) {
    return { error: "booking_type_id ไม่ถูกต้อง" };
  }

  const trimmedPurpose = purpose?.trim() || null;
  if (trimmedPurpose && trimmedPurpose.length > MAX_PURPOSE_LENGTH) {
    return {
      error: `เหตุผลการจองต้องไม่เกิน ${MAX_PURPOSE_LENGTH} ตัวอักษร`,
    };
  }

  return {
    value: { meetingName, roomId, bookingTypeId, purpose: trimmedPurpose },
  };
}

/* ตรวจวัน-เวลาของ 1 ใบ */
function validateOccurrence({ booking_date, start_dateTime, end_dateTime }) {
  const startAt = new Date(start_dateTime);
  const endAt = new Date(end_dateTime);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return {
      error: "start_dateTime และ end_dateTime ต้องเป็นวันเวลาที่ถูกต้อง",
    };
  }

  if (startAt >= endAt) {
    return { error: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม" };
  }

  /* booking_date ใช้ค่าจาก client เพราะเป็นวันตามเวลาท้องถิ่นของผู้จอง
     ไม่ใช่วันที่ได้จากการแปลง start_dateTime (UTC) ซึ่งอาจเหลื่อมไปอีกวัน */
  const bookingDate = DATE_PATTERN.test(booking_date ?? "")
    ? booking_date
    : startAt.toISOString().slice(0, 10);

  return {
    value: {
      bookingDate,
      startDateTime: start_dateTime,
      endDateTime: end_dateTime,
    },
  };
}

/**
 * สร้าง booking จากฝั่ง admin แล้วอนุมัติทันที
 * requester_id ยึดจาก token เท่านั้น ไม่รับจาก body เพราะเส้นนี้อนุมัติเองและสั่งเปิดห้องจริง
 */
export const createBooking = async (req, res) => {
  try {
    const shared = validateSharedBookingFields(req.body);
    if (shared.error) {
      return res.status(400).json({ error: shared.error });
    }

    const occurrence = validateOccurrence(req.body);
    if (occurrence.error) {
      return res.status(400).json({ error: occurrence.error });
    }

    const booking = await bookingService.createApprovedBooking({
      ...shared.value,
      ...occurrence.value,
      requesterId: req.user.id,
      actionBy: req.user.id,
      phone: req.body.phone || null,
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

/**
 * สร้างหลายใบจากรูปแบบจองต่อเนื่อง
 * input พัง -> 400 ไม่สร้างสักใบ (client พัง) / ชนเวลา -> สร้างเท่าที่ได้ + skipped[] (โลกเปลี่ยน)
 */
export const createBookingsBulk = async (req, res) => {
  try {
    const shared = validateSharedBookingFields(req.body);
    if (shared.error) {
      return res.status(400).json({ error: shared.error });
    }

    const { occurrences } = req.body;
    if (!Array.isArray(occurrences) || occurrences.length === 0) {
      return res.status(400).json({ error: "กรุณาระบุรายการวันที่ที่ต้องการจอง" });
    }

    /* กันไว้ฝั่ง server ด้วย ไม่เชื่อ cap ของ client
       นี่คือเพดานต่อ 1 request ไม่ใช่เพดานของทั้งชุด (client ซอยเป็นก้อนมาให้แล้ว) */
    if (occurrences.length > MAX_BULK_OCCURRENCES) {
      return res.status(400).json({
        error: `สร้างได้สูงสุด ${MAX_BULK_OCCURRENCES} รายการต่อครั้ง`,
      });
    }

    const normalized = [];
    for (const occurrence of occurrences) {
      const result = validateOccurrence(occurrence);
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }
      normalized.push(result.value);
    }

    const { created, skipped } = await bookingService.createApprovedBookingsBulk({
      ...shared.value,
      requesterId: req.user.id,
      actionBy: req.user.id,
      phone: req.body.phone || null,
      occurrences: normalized,
    });

    const body = {
      success: created.length > 0,
      created,
      skipped,
      summary: {
        requested: normalized.length,
        created: created.length,
        skipped: skipped.length,
      },
    };

    /* ตอบ 201 เสมอเมื่อ validation ผ่าน แม้ created จะเป็น [] —
       "ชนเวลา" คือผลลัพธ์ที่ประมวลผลสำเร็จแล้ว ไม่ใช่คำขอที่ทำไม่ได้
       และ client ซอย occurrences เป็นก้อนส่งมา ก้อนเดียวจึงไม่ใช่ทั้งคำขอ
       ถ้าตอบ 409 ที่ก้อนกลาง axios จะ throw แล้วก้อนที่เหลือจะไม่ถูกส่งเลย
       ผู้เรียกดูผลจาก summary.created / skipped[] เอา */
    return res.status(201).json(body);
  } catch (error) {
    console.error("[Booking] Create bulk bookings error:", error);

    return res.status(500).json({
      error: error.message || "Failed to create bookings",
    });
  }
};

const MAX_RANGE_DAYS = 400;

/* booking ในช่วงวันที่ สำหรับเช็คเวลาชนล่วงหน้าของการจองต่อเนื่อง */
export const getBookingsInRange = async (req, res) => {
  try {
    const { from, to, roomId } = req.query;

    if (!DATE_PATTERN.test(from ?? "") || !DATE_PATTERN.test(to ?? "")) {
      return res.status(400).json({ error: "from และ to ต้องอยู่ในรูปแบบ YYYY-MM-DD" });
    }

    if (from > to) {
      return res.status(400).json({ error: "from ต้องไม่มากกว่า to" });
    }

    /* booking_date น่าจะไม่มี index (repo ไม่มี migration file จึงไม่มีรายการ index ที่ควบคุมได้)
       BETWEEN แบบไม่จำกัดช่วงคือ full scan */
    const spanDays =
      (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000;
    if (spanDays > MAX_RANGE_DAYS) {
      return res.status(400).json({ error: `ช่วงวันที่ต้องไม่เกิน ${MAX_RANGE_DAYS} วัน` });
    }

    const parsedRoomId = roomId == null || roomId === "" ? null : Number(roomId);
    if (parsedRoomId != null && !Number.isInteger(parsedRoomId)) {
      return res.status(400).json({ error: "roomId ไม่ถูกต้อง" });
    }

    const data = await bookingService.getBookingsInRange(from, to, parsedRoomId);

    return res.json({ from, to, count: data.length, data });
  } catch (error) {
    console.error("[Booking] Get bookings in range error:", error);

    return res.status(500).json({ error: error.message || "Failed to fetch bookings" });
  }
};
