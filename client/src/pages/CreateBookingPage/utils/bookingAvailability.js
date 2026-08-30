import dayjs from "dayjs";

const OCCUPYING_STATUS_IDS = [2, 5];
const OCCUPYING_STATUS_NAMES = ["approved", "checked-in"];

export function getApprovedBookings(bookings) {
  if (!Array.isArray(bookings)) return [];
  return bookings.filter(
    (b) =>
      OCCUPYING_STATUS_IDS.includes(Number(b?.status_id)) ||
      OCCUPYING_STATUS_NAMES.includes(b?.booking_status),
  );
}

function timeRangesOverlap(startA, endA, startB, endB) {
  return dayjs(startA).isBefore(endB) && dayjs(endA).isAfter(startB);
}

export function getApprovedBookingsForRoomOnDate(bookings, dateStr, roomId) {
  const approved = getApprovedBookings(bookings);
  return approved.filter((b) => {
    const bookingDateRaw = b.booking_date ?? b.start_dateTime;
    const bookingDate = bookingDateRaw
      ? dayjs(bookingDateRaw).format("YYYY-MM-DD")
      : "";
    if (bookingDate !== dateStr) return false;
    if (roomId != null && Number(b.room_id) !== Number(roomId)) return false;
    return true;
  });
}

export function getConflictingApprovedBookings(
  bookings,
  dateStr,
  roomId,
  startTime,
  endTime,
) {
  if (!dateStr || roomId == null || !startTime || !endTime) return [];

  const rangeStart = dayjs(`${dateStr} ${startTime}`, "YYYY-MM-DD HH:mm");
  const rangeEnd = dayjs(`${dateStr} ${endTime}`, "YYYY-MM-DD HH:mm");

  return getApprovedBookingsForRoomOnDate(bookings, dateStr, roomId).filter(
    (b) =>
      timeRangesOverlap(
        rangeStart,
        rangeEnd,
        dayjs(b.start_dateTime),
        dayjs(b.end_dateTime),
      ),
  );
}

export function getRoomIdsBookedInRange(bookings, dateStr, startTime, endTime) {
  const approved = getApprovedBookingsForRoomOnDate(
    bookings,
    dateStr,
    undefined,
  );
  const booked = new Set();
  const rangeStart = dayjs(`${dateStr} ${startTime}`, "YYYY-MM-DD HH:mm");
  const rangeEnd = dayjs(`${dateStr} ${endTime}`, "YYYY-MM-DD HH:mm");
  approved.forEach((b) => {
    const start = dayjs(b.start_dateTime);
    const end = dayjs(b.end_dateTime);
    if (timeRangesOverlap(rangeStart, rangeEnd, start, end)) {
      booked.add(Number(b.room_id));
    }
  });
  return booked;
}
