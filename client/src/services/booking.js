import { apiClient } from "../lib/apiClient";

export const getBookings = async ({
  page,
  limit,
  bookingTypes,
  floors,
  statuses,
}) => {
  const params = {
    page,
    limit,
  };

  if (bookingTypes?.length) {
    params.bookingTypes = bookingTypes.join(",");
  }

  if (floors?.length) {
    params.floors = floors.join(",");
  }

  if (statuses?.length) {
    params.statuses = statuses.join(",");
  }

  const res = await apiClient.get("/bookings", {
    params,
  });

  return res.data;
};

export const updateBookingStatus = async (
  id,
  status,
  reason = "",
  cancelIds = [],
) => {
  const res = await apiClient.patch(`/bookings/${id}/status`, {
    status,
    reason,
    cancelIds,
  });

  return res.data;
};

export const getBookingById = async (id) => {
  const res = await apiClient.get(`/bookings/${id}`);

  return res.data;
};

export const getApproveBookingFilters = async () => {
  const res = await apiClient.get("/bookings/filters");

  return res.data;
};

export const deleteBookings = async (ids) => {
  const response = await apiClient.delete("/bookings", {
    data: {
      ids,
    },
  });

  return response.data;
};

/* booking ทั้งวัน สำหรับปฏิทิน/รายการ/เช็คเวลาชนในหน้าสร้างการจอง */
export const getBookingsOnDate = async (date) => {
  const res = await apiClient.get(`/bookings/date/${date}`);

  return res.data.data;
};

/* สร้าง booking จากฝั่ง admin — server อนุมัติให้ทันที */
export const createBooking = async (payload) => {
  const res = await apiClient.post("/bookings", payload);

  return res.data;
};

/* ประเภทการจอง reuse จาก endpoint filters ที่หน้าอนุมัติใช้อยู่แล้ว */
export const getBookingTypes = async () => {
  const res = await apiClient.get("/bookings/filters");

  return res.data?.bookingTypes ?? [];
};

/* booking ในช่วงวันที่ สำหรับเช็คเวลาชนล่วงหน้าของการจองต่อเนื่อง
   เป็นเพียง advisory: อ่านที่เวลา T แต่ insert ที่ T+delta จึงมีสิทธิ์มีคนแทรก
   ตัวตัดสินจริงคือ WHERE NOT EXISTS ต่อแถวฝั่ง server */
export const getBookingsInRange = async (from, to, roomId = null) => {
  const res = await apiClient.get("/bookings/range", {
    params: roomId == null ? { from, to } : { from, to, roomId },
  });

  return res.data.data;
};

/* ขนาดก้อนต่อ 1 request — เรื่อง transport ล้วน ผู้ใช้ไม่เห็น จึงอยู่ชั้น service ไม่ใช่ page util
   วัดจริงบน Supabase ap-south-1: INSERT p50 99ms / p95 167ms ต่อแถว
   => 15 แถว ~1.5 วิ (p50) / ~2.5 วิ (p95) สบายภายใน timeout 20 วิ */
const BULK_BATCH_SIZE = 15;

/* 1 request = 1 ก้อน — timeout ยาวกว่าปกติเพราะ 1 ก้อนคือ INSERT หลายแถว
   วัดจริง: 15 แถว ~1.5 วิ (p50) / ~2.5 วิ (p95) จึงเหลือ headroom เยอะ */
const postBulkChunk = (payload) =>
  apiClient.post("/bookings/bulk", payload, { timeout: 20000 });

/**
 * สร้างหลายใบจากรูปแบบจองต่อเนื่อง — server อนุมัติให้ทันทีทุกใบ
 * ซอยเป็นก้อนแล้วรวมผล เพื่อไม่ให้ request เดียวยาวจนโดน proxy ตัด
 * ส่งเรียงทีละก้อน ไม่ใช่ Promise.all เพราะสองก้อนที่วิ่งพร้อมกันอาจแทรกกันเอง
 * และการส่งเรียงทำให้ยอดสะสมที่รายงานตรงกับความจริง
 */
export const createBookingsBulk = async ({ occurrences, ...shared }) => {
  const created = [];
  const skipped = [];

  try {
    for (let index = 0; index < occurrences.length; index += BULK_BATCH_SIZE) {
      const chunk = occurrences.slice(index, index + BULK_BATCH_SIZE);
      const res = await postBulkChunk({ ...shared, occurrences: chunk });

      created.push(...(res.data.created ?? []));
      skipped.push(...(res.data.skipped ?? []));
    }
  } catch (error) {
    /* ก้อนก่อนหน้า commit ไปแล้วจริง ต้องไม่ทิ้งยอดที่สำเร็จไปกับ error */
    error.partial = { created, skipped };
    throw error;
  }

  return {
    created,
    skipped,
    summary: {
      requested: occurrences.length,
      created: created.length,
      skipped: skipped.length,
    },
  };
};
