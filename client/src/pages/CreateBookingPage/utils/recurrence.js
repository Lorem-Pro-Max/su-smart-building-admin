import dayjs from "dayjs";
import { toTimeOfDay } from "./bookingTime";
import { getConflictingApprovedBookings } from "./bookingAvailability";

export const RECURRENCE_UNIT = { WEEK: "week", MONTH: "month" };

export const MAX_INTERVAL = { week: 4, month: 12 };

/* limit เดียวที่ admin เห็น (ผ่าน disabledDate ของช่องวันสิ้นสุด) */
export const MAX_UNTIL_MONTHS = 6;

/* กัน input วิปริตเท่านั้น ไม่ใช่กฎธุรกิจ — 6 เดือน x ทุกวัน = ~182 จึงไม่ผูกในทางปฏิบัติ */
export const MAX_OCCURRENCES = 200;

/* เรียงตามที่แสดงในดีไซน์ M T W T F S S -> ค่าของ dayjs .day() */
export const WEEKDAY_OPTIONS = [
  { value: 1, label: "M", short: "จ.", full: "จันทร์" },
  { value: 2, label: "T", short: "อ.", full: "อังคาร" },
  { value: 3, label: "W", short: "พ.", full: "พุธ" },
  { value: 4, label: "T", short: "พฤ.", full: "พฤหัสบดี" },
  { value: 5, label: "F", short: "ศ.", full: "ศุกร์" },
  { value: 6, label: "S", short: "ส.", full: "เสาร์" },
  { value: 0, label: "S", short: "อา.", full: "อาทิตย์" },
];

const UNIT_LABEL = { week: "สัปดาห์", month: "เดือน" };

export function clampInterval(interval, unit) {
  const max = MAX_INTERVAL[unit] ?? 1;
  const value = Number(interval);
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.trunc(value), 1), max);
}

/* pattern ไม่เก็บ anchorDate ไว้เอง — ฟอร์มเป็นเจ้าของวันที่จอง
   ถ้าเก็บสำเนาไว้ พอแอดมินเปลี่ยนวันหลังตั้งรูปแบบ สำเนาจะค้างและขัดกับวันที่ generate จริง */
export function createEmptyPattern(anchorDate) {
  const anchor = dayjs(anchorDate);
  return {
    unit: RECURRENCE_UNIT.WEEK,
    interval: 1,
    /* ติ๊กวันของวันตั้งต้นไว้ให้ เพื่อให้รูปแบบเริ่มต้นตรงกับสิ่งที่ admin กรอกมาแล้ว */
    weekdays: anchor.isValid() ? [anchor.day()] : [],
    untilDate: null,
  };
}

/**
 * สร้างรายการ "วันที่" ตามรูปแบบทำซ้ำ ทำงานใน local calendar space ล้วน
 * ไม่มี Date / UTC / ISO เข้ามาเกี่ยวเลย (ดูเหตุผลใน occurrenceToPayload)
 */
export function generateOccurrenceDates({ anchorDate, pattern, now = dayjs() }) {
  const anchor = dayjs(anchorDate).startOf("day");
  const until = dayjs(pattern?.untilDate).startOf("day");
  const today = dayjs(now).startOf("day");

  if (!anchor.isValid() || !until.isValid() || until.isBefore(anchor)) {
    return { dates: [], skippedMonths: [] };
  }

  const interval = clampInterval(pattern.interval, pattern.unit);
  const seen = new Map(); // "YYYY-MM-DD" -> Dayjs — ได้ dedupe มาฟรี
  const skippedMonths = [];

  const push = (date) => {
    if (date.isBefore(anchor) || date.isAfter(until) || date.isBefore(today)) return;
    const key = date.format("YYYY-MM-DD");
    if (!seen.has(key)) seen.set(key, date);
  };

  /* วันตั้งต้นอยู่ในชุดเสมอ ไม่ว่า weekday ของมันจะถูกติ๊กหรือไม่ —
     admin กรอกวัน/ห้อง/เวลานั้นมาเอง "จองต่อเนื่อง" เป็นส่วนขยาย ไม่ใช่ตัวแทน */
  push(anchor);

  if (pattern.unit === RECURRENCE_UNIT.WEEK) {
    const weekdays = [...new Set(pattern.weekdays ?? [])];
    /* .day(0) ให้วันอาทิตย์ของสัปดาห์นั้นแบบ deterministic
       ไม่ใช้ .startOf("week") เพราะผลขึ้นกับ locale ที่ตั้งไว้ */
    let weekBase = anchor.day(0);
    let guard = 0;
    while (weekdays.length > 0 && !weekBase.isAfter(until) && guard++ < 500) {
      weekdays.forEach((weekday) => push(weekBase.add(weekday, "day")));
      weekBase = weekBase.add(interval, "week");
    }
  } else {
    const dayOfMonth = anchor.date();
    /* ห้าม .add(n,"month") บนวันตั้งต้น — dayjs("2026-01-31").add(1,"month") = 2026-02-28
       แล้วความคลาดเคลื่อนจะลามต่อ (Feb 28 -> Mar 28 ไม่ใช่ Mar 31)
       จึงวนบนวันที่ 1 ของเดือนแล้ว .date() ใหม่ทุกรอบ */
    let monthBase = anchor.startOf("month");
    let guard = 0;
    while (!monthBase.isAfter(until) && guard++ < 200) {
      if (monthBase.daysInMonth() >= dayOfMonth) {
        push(monthBase.date(dayOfMonth));
      } else if (!monthBase.isBefore(anchor.startOf("month"))) {
        /* เดือนที่ไม่มีวันที่นั้น = ข้าม ไม่ปัดไปวันสุดท้าย
           booking พวกนี้สั่งเปิดห้องจริง การปัด "วันที่ 31" ไป 28 ก.พ.
           คือไปยึดห้องวันที่ admin ไม่ได้ขอ ซึ่งแย่กว่าการไม่มีเลย */
        skippedMonths.push(monthBase);
      }
      monthBase = monthBase.add(interval, "month");
    }
  }

  const dates = [...seen.values()].sort((a, b) => a.valueOf() - b.valueOf());
  return { dates, skippedMonths };
}

export function buildOccurrences({ anchorDate, pattern, startTime, endTime, now = dayjs() }) {
  const { dates, skippedMonths } = generateOccurrenceDates({ anchorDate, pattern, now });
  const anchorKey = dayjs(anchorDate).format("YYYY-MM-DD");

  const all = dates
    .map((date) => {
      const dateStr = date.format("YYYY-MM-DD");
      return {
        key: dateStr,
        dateStr,
        date,
        startAt: toTimeOfDay(startTime, date),
        endAt: toTimeOfDay(endTime, date),
        isAnchor: dateStr === anchorKey,
        conflicts: [],
      };
    })
    .filter(
      (item) =>
        item.startAt &&
        item.endAt &&
        item.endAt.isAfter(item.startAt) &&
        !item.startAt.isBefore(now),
    );

  return {
    occurrences: all.slice(0, MAX_OCCURRENCES),
    totalGenerated: all.length,
    truncated: all.length > MAX_OCCURRENCES,
    skippedMonths,
  };
}

/**
 * ติดป้ายว่าใบไหนชนกับการจองที่มีอยู่
 * เป็นเพียงการเช็คล่วงหน้า (advisory) — อ่านข้อมูลที่เวลา T แต่ insert ที่ T+ดeltaจึงมีสิทธิ์มีคนแทรก
 * ตัวตัดสินจริงคือ WHERE NOT EXISTS ต่อแถวใน bookingService.insertApprovedBookingRow
 * ดังนั้นการรายงานผลต้องใช้ตัวเลขจาก response ของ server ไม่ใช่ตัวเลขที่นับไว้ตรงนี้
 */
export function annotateConflicts(occurrences, existingBookings, roomId, startTime, endTime) {
  return occurrences.map((occurrence) => ({
    ...occurrence,
    conflicts: getConflictingApprovedBookings(
      existingBookings,
      occurrence.dateStr,
      roomId,
      startTime,
      endTime,
    ),
  }));
}

/**
 * ชนกันเองในชุด — ปัจจุบันเป็นไปไม่ได้ (dedupe รายวัน + ทุกใบใช้เวลาเดียวกัน)
 * แต่จะกลายเป็นของจำเป็นทันทีที่เพิ่มการแก้เวลารายครั้ง จึงทำรอไว้
 */
export function findIntraSetConflicts(occurrences) {
  const sorted = [...occurrences].sort((a, b) => a.startAt.valueOf() - b.startAt.valueOf());
  const pairs = [];
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index - 1].endAt.isAfter(sorted[index].startAt)) {
      pairs.push([sorted[index - 1], sorted[index]]);
    }
  }
  return pairs;
}

export function formatRecurrenceSummary(pattern, anchorDate) {
  if (!pattern) return "";

  const unitLabel = UNIT_LABEL[pattern.unit] ?? UNIT_LABEL.week;
  const every =
    pattern.interval === 1 ? `ทุก${unitLabel}` : `ทุก ${pattern.interval} ${unitLabel}`;

  const middle =
    pattern.unit === RECURRENCE_UNIT.MONTH
      ? anchorDate && dayjs(anchorDate).isValid()
        ? `วันที่ ${dayjs(anchorDate).date()}`
        : ""
      : WEEKDAY_OPTIONS.filter((day) => pattern.weekdays?.includes(day.value))
          .map((day) => day.short)
          .join(" ");

  const until = pattern.untilDate
    ? `ถึง ${dayjs(pattern.untilDate).format("DD MMM YYYY")}`
    : "";

  return [every, middle, until].filter(Boolean).join(" · ");
}

/* booking_date มาจากวันตามปฏิทิน local ส่วน start/end เป็น instant UTC ของวันเดียวกันนั้น
   ห้าม derive booking_date กลับจาก ISO string เพราะที่ offset ติดลบ วันจะเหลื่อมไป 1 วันทั้งชุด */
export const occurrenceToPayload = (occurrence) => ({
  booking_date: occurrence.date.format("YYYY-MM-DD"),
  start_dateTime: occurrence.startAt.toISOString(),
  end_dateTime: occurrence.endAt.toISOString(),
});
