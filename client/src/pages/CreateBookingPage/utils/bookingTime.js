import dayjs from "dayjs";

export const BOOKING_TIME_FORMAT = "HH:mm";
export const BOOKING_START_HOUR = 8;
export const BOOKING_END_HOUR = 21;

const range = (start, end) => Array.from({ length: end - start }, (_, index) => start + index);

export function toTimeOfDay(timeString, baseDate = dayjs()) {
  if (!timeString) return null;

  const [hour, minute] = timeString.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  return dayjs(baseDate).hour(hour).minute(minute).second(0).millisecond(0);
}

/* "08:00 - 10:00, 13:00 - 15:00" — ใช้ทั้งใน TimeInput และ preview ของการจองต่อเนื่อง */
export function formatBookingRanges(bookingList) {
  return bookingList
    .slice()
    .sort((first, second) => dayjs(first.start_dateTime) - dayjs(second.start_dateTime))
    .map(
      (booking) =>
        `${dayjs(booking.start_dateTime).format(BOOKING_TIME_FORMAT)} - ${dayjs(booking.end_dateTime).format(BOOKING_TIME_FORMAT)}`
    )
    .join(", ");
}

export function formatTime(value) {
  return value ? dayjs(value).format(BOOKING_TIME_FORMAT) : null;
}

export function buildDisabledTime({
  selectedDate,
  minTime = null,
  blockPastTime = true,
} = {}) {
  return () => {
    const now = dayjs();
    const isToday = blockPastTime && selectedDate
      ? dayjs(selectedDate).isSame(now, "day")
      : false;
    const [minHour, minMinute] = minTime ? minTime.split(":").map(Number) : [null, null];

    const earliestHour = Math.max(
      BOOKING_START_HOUR,
      isToday ? now.hour() : BOOKING_START_HOUR,
      minHour ?? BOOKING_START_HOUR
    );

    return {
      disabledHours: () =>
        range(0, 24).filter((hour) => hour < earliestHour || hour > BOOKING_END_HOUR),
      disabledMinutes: (selectedHour) => {
        if (selectedHour < 0) return [];
        if (selectedHour === BOOKING_END_HOUR) return range(1, 60);

        const disabledMinutes = new Set();

        if (isToday && selectedHour === now.hour()) {
          range(0, now.minute()).forEach((minute) => disabledMinutes.add(minute));
        }

        if (minHour !== null && selectedHour === minHour) {
          range(0, minMinute + 1).forEach((minute) => disabledMinutes.add(minute));
        }

        return Array.from(disabledMinutes);
      },
    };
  };
}
