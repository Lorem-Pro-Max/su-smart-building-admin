import { describe, expect, it } from "vitest";
import dayjs from "dayjs";

import {
  buildOccurrences,
  clampInterval,
  formatRecurrenceSummary,
  generateOccurrenceDates,
} from "./recurrence";

/* ตรึงเวลาไว้ ไม่งั้นเคส "ตัดอดีตทิ้ง" จะพังเองเมื่อเวลาผ่านไป */
const NOW = dayjs("2026-01-01");

const dates = (anchor, pattern) =>
  generateOccurrenceDates({ anchorDate: dayjs(anchor), pattern, now: NOW }).dates.map((d) =>
    d.format("YYYY-MM-DD"),
  );

describe("generateOccurrenceDates — รายสัปดาห์", () => {
  it("วันตั้งต้นอยู่ในชุดเสมอ แม้ weekday ของมันไม่ถูกติ๊ก", () => {
    // 2026-01-05 = จันทร์ แต่ติ๊กแค่ อังคาร/พุธ/ศุกร์
    expect(dates("2026-01-05", { unit: "week", interval: 1, weekdays: [2, 3, 5], untilDate: dayjs("2026-01-11") }))
      .toEqual(["2026-01-05", "2026-01-06", "2026-01-07", "2026-01-09"]);
  });

  it("ไม่ซ้ำเมื่อ weekday ของวันตั้งต้นถูกติ๊กด้วย", () => {
    expect(dates("2026-01-05", { unit: "week", interval: 1, weekdays: [1], untilDate: dayjs("2026-01-19") }))
      .toEqual(["2026-01-05", "2026-01-12", "2026-01-19"]);
  });

  it("interval 2 เว้นสัปดาห์", () => {
    expect(dates("2026-01-05", { unit: "week", interval: 2, weekdays: [1], untilDate: dayjs("2026-02-02") }))
      .toEqual(["2026-01-05", "2026-01-19", "2026-02-02"]);
  });

  it("วันตั้งต้นเป็นอาทิตย์ + ติ๊กจันทร์ ต้องได้วันถัดไป ไม่ใช่จันทร์สัปดาห์ก่อน", () => {
    // ถ้าใช้ startOf("week") ตาม locale อาจเลื่อนไปหลัง แล้วได้ 2025-12-29 ซึ่งเป็นอดีต
    expect(dates("2026-01-04", { unit: "week", interval: 1, weekdays: [1], untilDate: dayjs("2026-01-12") }))
      .toEqual(["2026-01-04", "2026-01-05", "2026-01-12"]);
  });

  it("ไม่ติ๊กวันเลย ได้แค่วันตั้งต้น", () => {
    expect(dates("2026-01-05", { unit: "week", interval: 1, weekdays: [], untilDate: dayjs("2026-03-01") }))
      .toEqual(["2026-01-05"]);
  });
});

describe("generateOccurrenceDates — รายเดือน", () => {
  it("ข้ามเดือนที่ไม่มีวันที่นั้น ไม่ปัดไปวันสุดท้าย", () => {
    expect(dates("2026-01-31", { unit: "month", interval: 1, untilDate: dayjs("2026-06-30") }))
      .toEqual(["2026-01-31", "2026-03-31", "2026-05-31"]);
  });

  it("รายงานเดือนที่ถูกข้ามออกมาด้วย ไม่เงียบ", () => {
    const { skippedMonths } = generateOccurrenceDates({
      anchorDate: dayjs("2026-01-31"),
      pattern: { unit: "month", interval: 1, untilDate: dayjs("2026-06-30") },
      now: NOW,
    });
    expect(skippedMonths.map((m) => m.format("MMM YYYY"))).toEqual(["Feb 2026", "Apr 2026", "Jun 2026"]);
  });

  it("ไม่ drift — วันที่ 31 ต้องคงเป็น 31 ไม่ใช่ 28 แล้วเพี้ยนต่อ", () => {
    // dayjs("2026-01-31").add(1,"month") = 2026-02-28 แล้ว +1 เดือนได้ 03-28 ไม่ใช่ 03-31
    expect(dates("2026-01-31", { unit: "month", interval: 1, untilDate: dayjs("2026-03-31") }).at(-1))
      .toBe("2026-03-31");
  });

  it("วันที่ 29 ข้าม ก.พ. ปีปกติ", () => {
    expect(dates("2026-01-29", { unit: "month", interval: 1, untilDate: dayjs("2026-03-31") }))
      .toEqual(["2026-01-29", "2026-03-29"]);
  });

  it("วันที่ 29 อยู่ได้ใน ก.พ. ปีอธิกสุรทิน", () => {
    expect(dates("2028-01-29", { unit: "month", interval: 1, untilDate: dayjs("2028-03-31") }))
      .toEqual(["2028-01-29", "2028-02-29", "2028-03-29"]);
  });
});

describe("generateOccurrenceDates — ขอบเขต", () => {
  it("นับวันสิ้นสุดรวมด้วย (inclusive)", () => {
    expect(dates("2026-01-05", { unit: "week", interval: 1, weekdays: [1], untilDate: dayjs("2026-01-12") }))
      .toEqual(["2026-01-05", "2026-01-12"]);
  });

  it("ตัดวันที่เป็นอดีตทิ้ง", () => {
    expect(dates("2025-12-29", { unit: "week", interval: 1, weekdays: [1], untilDate: dayjs("2026-01-12") }))
      .toEqual(["2026-01-05", "2026-01-12"]);
  });

  it("วันสิ้นสุดอยู่ก่อนวันตั้งต้น ได้ชุดว่าง", () => {
    expect(dates("2026-01-05", { unit: "week", interval: 1, weekdays: [1], untilDate: dayjs("2025-12-01") }))
      .toEqual([]);
  });
});

describe("clampInterval", () => {
  it.each([
    [12, "week", 4],
    [99, "month", 12],
    [0, "week", 1],
    [-5, "month", 1],
  ])("clamp(%i, %s) = %i", (input, unit, expected) => {
    expect(clampInterval(input, unit)).toBe(expected);
  });
});

describe("formatRecurrenceSummary", () => {
  it("N=1 อ่านว่า 'ทุกสัปดาห์' ไม่ใช่ 'ทุก 1 สัปดาห์'", () => {
    expect(
      formatRecurrenceSummary({ unit: "week", interval: 1, weekdays: [2, 3, 5], untilDate: dayjs("2025-12-27") }),
    ).toBe("ทุกสัปดาห์ · อ. พ. ศ. · ถึง 27 Dec 2025");
  });

  it("รายเดือนใช้วันที่จาก anchorDate ที่ส่งเข้ามา ไม่ใช่ค่าที่ค้างใน pattern", () => {
    const pattern = { unit: "month", interval: 2, untilDate: dayjs("2026-12-27") };
    expect(formatRecurrenceSummary(pattern, dayjs("2026-06-27"))).toBe("ทุก 2 เดือน · วันที่ 27 · ถึง 27 Dec 2026");
    // เปลี่ยนวันตั้งต้นแล้วข้อความต้องตามทันที
    expect(formatRecurrenceSummary(pattern, dayjs("2026-06-15"))).toBe("ทุก 2 เดือน · วันที่ 15 · ถึง 27 Dec 2026");
  });
});

describe("buildOccurrences", () => {
  const pattern = { unit: "week", interval: 1, weekdays: [1], untilDate: dayjs("2026-01-12") };

  it("ติดป้ายวันตั้งต้นเป็นรายการแรก", () => {
    const { occurrences } = buildOccurrences({
      anchorDate: dayjs("2026-01-05"), pattern, startTime: "08:00", endTime: "10:00", now: NOW,
    });
    expect(occurrences.map((o) => o.isAnchor)).toEqual([true, false]);
  });

  it("ยึดวันตามปฏิทิน local คู่กับเวลานาฬิกา local ของวันนั้น", () => {
    const { occurrences } = buildOccurrences({
      anchorDate: dayjs("2026-01-05"), pattern, startTime: "08:00", endTime: "10:00", now: NOW,
    });
    expect(occurrences[1].dateStr).toBe("2026-01-12");
    expect(occurrences[1].startAt.format("YYYY-MM-DD HH:mm")).toBe("2026-01-12 08:00");
  });

  it("ยังไม่เลือกเวลา = ไม่มีรายการ (ตัวนับใน popover จึงต้องใช้ generateOccurrenceDates)", () => {
    const { occurrences } = buildOccurrences({
      anchorDate: dayjs("2026-01-05"), pattern, startTime: null, endTime: null, now: NOW,
    });
    expect(occurrences).toEqual([]);
  });
});
