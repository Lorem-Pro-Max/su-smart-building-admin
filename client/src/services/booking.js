import { apiClient } from "../lib/apiClient";

export const getBookings = async ({
  page,
  limit,
  bookingTypes,
  floors,
  statuses,
  date,
  startTime,
  endTime,
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

  if (date) {
    params.date = date;
  }

  if (startTime) {
    params.startTime = startTime;
  }

  if (endTime) {
    params.endTime = endTime;
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

export const getBookingsInRange = async (from, to, roomId = null) => {
  const res = await apiClient.get("/bookings/range", {
    params: roomId == null ? { from, to } : { from, to, roomId },
  });

  return res.data.data;
};

const BULK_BATCH_SIZE = 15;

const postBulkChunk = (payload) =>
  apiClient.post("/bookings/bulk", payload, { timeout: 20000 });

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
