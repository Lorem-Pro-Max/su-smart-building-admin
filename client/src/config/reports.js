// type ต้องตรงกับ REPORTS ใน server/src/services/reportService.js
export const REPORT_CONFIGS = {
  DOORS: { type: "doors", label: "ประตู", fileLabel: "การเปิดปิดประตู" },
  EXHAUST_FANS: {
    type: "exhaust-fans",
    label: "พัดลมดูดอากาศ",
    fileLabel: "การเปิดปิดพัดลมดูดอากาศ",
  },
  LIGHTS: { type: "lights", label: "แสงสว่าง", fileLabel: "การเปิดปิดไฟ" },
  AC: {
    type: "ac",
    label: "เครื่องปรับอากาศ",
    fileLabel: "การเปิดปิดเครื่องปรับอากาศ",
  },
  AIR_QUALITY: {
    type: "air-quality",
    label: "คุณภาพอากาศ",
    fileLabel: "คุณภาพอากาศ",
    // ต้องตรงกับ maxRangeMonths ของ "air-quality" ใน server/src/services/reportService.js
    maxRangeMonths: 1,
  },
  WATER: { type: "water", label: "น้ำ", fileLabel: "ประวัติการใช้น้ำ" },
  ELECTRICITY: {
    type: "electricity",
    label: "กระแสไฟฟ้า",
    fileLabel: "การใช้ไฟฟ้า",
  },
  ROOM_USAGE: {
    type: "room-usage",
    label: "ชั่วโมงการใช้ห้อง",
    fileLabel: "ชั่วโมงการใช้ห้อง",
  },
  BOOKINGS: {
    type: "bookings",
    label: "การจอง",
    fileLabel: "การจอง",
    allowFutureDates: true,
  },
};

// ต้องตรงกับ DEFAULT_MAX_RANGE_MONTHS ใน server/src/controllers/reportController.js
export const REPORT_MAX_RANGE_MONTHS = 12;
