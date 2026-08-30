const BOOKING_STATUS_META = {
  pending: {
    label: "รออนุมัติ",
    className: "bg-[#FA8C16] text-white",
    color: "warning",
    display: true,
  },
  approved: {
    label: "จองสำเร็จ",
    className: "bg-[#52C41A] text-white",
    color: "success",
    display: true,
  },
  /* status 5 ในฐานข้อมูลยังชื่อ checked-in แต่ความหมายคือห้องถูกเปิดอัตโนมัติตามเวลาจองแล้ว */
  "checked-in": {
    label: "ห้องเปิดแล้ว",
    className: "bg-[#1677FF] text-white",
    color: "processing",
    display: true,
  },
  completed: {
    label: "เสร็จสิ้น",
    className: "bg-[#0958D9] text-white",
    color: "blue",
    display: true,
  },
  rejectedByAdmin: {
    label: "ปฏิเสธ",
    className: "bg-[#FF4D4F] text-white",
    color: "error",
    display: false,
  },
  canceledByAdmin: {
    label: "ยกเลิก",
    className: "bg-[#C0C0C0] text-white",
    color: "default",
    display: false,
  },
  canceledByUser: {
    label: "ยกเลิก",
    className: "bg-[#C0C0C0] text-white",
    color: "default",
    display: false,
  },
};

const UNKNOWN_STATUS_META = {
  label: "ไม่ทราบสถานะ",
  className: "bg-[#C0C0C0] text-white",
  color: "default",
  display: false,
};

/* สถานะที่ยังใช้ห้องได้อยู่ (ยกเลิกได้ / นับเป็นการจองที่กำลังจะถึง) */
export const ACTIVE_BOOKING_STATUSES = ["pending", "approved", "checked-in"];

export function shouldHideBooking(status) {
  return status === "canceledByUser";
}

export function isUpcomingBooking(booking) {
  const status = booking?.booking_status;
  if (!status || shouldHideBooking(status)) return false;

  const now = new Date();
  const isNotFinished = new Date(booking.end_datetime) > now;

  return isNotFinished && ACTIVE_BOOKING_STATUSES.includes(status);
}

export function isHistoryBooking(booking) {
  if (shouldHideBooking(booking?.booking_status)) return false;

  const now = new Date();
  if (new Date(booking.end_datetime) <= now) {
    return true;
  }

  const finishedStatus = ["rejectedByAdmin", "canceledByAdmin", "completed"];

  return finishedStatus.includes(booking?.booking_status);
}

export function getActionReason(booking) {
  const status = booking?.booking_status;
  if (status !== "rejectedByAdmin" && status !== "canceledByAdmin") return null;

  return booking?.approval_reason?.trim() || null;
}

/* badge ในหน้าการจองของฉัน: สถานะที่ไม่รู้จักไม่ต้องแสดงอะไรเลย */
export function getStatusBadge(status) {
  const meta = BOOKING_STATUS_META[status];
  if (!meta) return null;

  return { label: meta.label, className: meta.className };
}

/* Tag ในการ์ดรายการจองของห้อง */
export function getStatusDetails(status) {
  const meta = BOOKING_STATUS_META[status] || UNKNOWN_STATUS_META;

  return { label: meta.label, color: meta.color, display: meta.display };
}
