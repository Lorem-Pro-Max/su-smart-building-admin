import pool from "../config/db.js";

/* approved(2) และ checked-in(5) = booking ที่ยังมีสิทธิ์ใช้ห้องอยู่ */
export const BOOKING_LIVE_STATUS_IDS = [2, 5];

export const fetchDeviceMapping = async () => {
  const query = `
    SELECT room_device.id, 
    room_device.device_id, 
    device_type.type, 
    device_type.key, 
    room.id AS room_id,
    room.title,
    room.floor,
    room.study_seats,
    room.exam_seats,
    room_device.key AS device_sub_id
    FROM room_device
    INNER JOIN device_type ON room_device.device_type_id = device_type.id
    INNER JOIN room ON room_device.room_id = room.id
    `;
  const { rows } = await pool.query(query);
  return rows;
};

export const fetchRoomDevice = async () => {
  const query = `
  SELECT room.id, 
  room_device.device_id, 
  room_device.key AS device_sub_id,
  device_type.key FROM room
  INNER JOIN room_device ON room.id = room_device.room_id
  INNER JOIN device_type ON room_device.device_type_id = device_type.id
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const fetchRoomSensor = async () => {
  const query = `
  SELECT room.id as room_id, 
  room_device.device_id as device_id
  FROM room
  INNER JOIN room_device ON room.id = room_device.room_id
  WHERE room_device.device_type_id = 9
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const fetchIotSchedule = async () => {
  const query = `
    SELECT id as schedule_id,   
    booking_id, 
    device_id, 
    action_time, 
    action,
    action_by
    FROM iot_schedule
    WHERE record_status = 'pending'`;
  const { rows } = await pool.query(query);
  return rows;
};

export const logSystemEvent = (
  source,
  level,
  event_type,
  detail,
  meta = {},
) => {
  const query = `
    INSERT INTO system_log (source, level, event_type, detail, meta)
    VALUES ($1, $2, $3, $4, $5)
  `;

  const values = [source, level, event_type, detail, JSON.stringify(meta)];

  pool.query(query, values).catch((error) => {
    console.error(`[LOG_BUCKET_FAIL] ${source}: ${error.message}`);
  });
};

export const updateIotScheduleStatus = async (scheduleId, status) => {
  const query = `
    UPDATE iot_schedule 
    SET record_status = $1
    WHERE id = $2
  `;

  try {
    const result = await pool.query(query, [status, scheduleId]);

    if (result.rowCount === 0) {
      logSystemEvent(
        "schedule",
        "warn",
        "DB_UPDATE_MISS",
        `No record found for ID: ${scheduleId}`,
      );
    }
  } catch (error) {
    console.error(
      `[DB_ERROR] Failed to update schedule ${scheduleId}:`,
      error.message,
    );
    throw error;
  }
};

export const logIotAction = (deviceDbId, action, actionBy = 1) => {
  const query = `
    INSERT INTO iot_log (device_id, action, action_by, action_time)
    VALUES ($1, $2, $3, NOW())
  `;

  pool.query(query, [deviceDbId, action, actionBy]).catch((err) => {
    console.error(`[IOT_LOG_FAIL] Device ${deviceDbId}: ${err.message}`);
  });
};

export const fetchActiveBookings = async () => {
  const query = `
    SELECT
    room_id,
    "end_dateTime"
    FROM room_booking
    WHERE status_id IN (${BOOKING_LIVE_STATUS_IDS.join(", ")})
    AND "start_dateTime" <= NOW()
    AND "end_dateTime" > NOW()
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const logHpsStatus = (deviceDbId, status) => {
  const query = `
    INSERT INTO hps_status_log (device_id, status, recorded_at)
    VALUES ($1, $2, NOW())
  `;
  pool.query(query, [deviceDbId, status]).catch((err) => {
    console.error(`[HPS_LOG_FAIL] DB ID ${deviceDbId}: ${err.message}`);
  });
};

export const logSdDetection = (deviceDbId, status = 'detected') => {
  const query = `
    INSERT INTO sd_status_log (device_id, status, recorded_at)
    VALUES ($1, $2, NOW())
  `;

  pool.query(query, [deviceDbId, status]).catch((err) => {
    console.error(`[SD_LOG_FAIL] DB ID ${deviceDbId}: ${err.message}`);
  });
};

export const fetchBookingById = async (bookingId) => {
  const query = `
    SELECT
      rb.id,
      rb.room_id,
      rb.status_id,
      rb."start_dateTime",
      rb."end_dateTime",
      r.title AS room_title
    FROM room_booking rb
    LEFT JOIN room r ON rb.room_id = r.id
    WHERE rb.id = $1
  `;
  const { rows } = await pool.query(query, [bookingId]);
  return rows[0] || null;
};

export const fetchIotScheduleStatus = async (scheduleId) => {
  const query = `
    SELECT record_status
    FROM iot_schedule
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [scheduleId]);
  return rows[0]?.record_status || null;
};

/**
 * worker อ่านสถานะ booking ตอนเริ่ม job แล้วค่อยเขียนกลับหลังสั่งอุปกรณ์เสร็จ
 * ถ้ามีการยกเลิกแทรกเข้ามาระหว่างนั้น ต้องไม่เขียนทับให้กลับมาเป็น "ห้องเปิดแล้ว" อีก
 * จึงอัปเดตเฉพาะใบที่ยังมีสิทธิ์ใช้ห้องอยู่เท่านั้น (ห้องที่เปิดไปแล้วปล่อยเปิดค้างตามเดิม)
 */
export const updateBookingStatusId = async (bookingId, statusId) => {
  const query = `
    UPDATE room_booking
    SET status_id = $1,
        action_date = NOW()
    WHERE id = $2
      AND status_id <> $1
      AND status_id IN (${BOOKING_LIVE_STATUS_IDS.join(", ")})
  `;

  try {
    const { rowCount } = await pool.query(query, [statusId, bookingId]);

    if (rowCount === 0) {
      logSystemEvent(
        "schedule",
        "info",
        "BOOKING_STATUS_UPDATE_SKIPPED",
        `Booking ${bookingId} is no longer live. Status kept as is.`,
        { bookingId, statusId },
      );
    }
  } catch (error) {
    logSystemEvent(
      "schedule",
      "error",
      "BOOKING_STATUS_UPDATE_FAIL",
      error.message,
      { bookingId, statusId },
    );
  }
};

/* ใช้กันไม่ให้ auto-shutdown ปิดห้องระหว่างที่ booking ยังไม่หมดเวลา */
export const hasBookingInProgress = async (roomId) => {
  const query = `
    SELECT 1
    FROM room_booking
    WHERE room_id = $1
      AND status_id IN (${BOOKING_LIVE_STATUS_IDS.join(", ")})
      AND "start_dateTime" <= NOW()
      AND "end_dateTime" > NOW()
    LIMIT 1
  `;

  try {
    const { rows } = await pool.query(query, [roomId]);
    return rows.length > 0;
  } catch (error) {
    console.error(`[BOOKING_CHECK_FAIL] Room ${roomId}: ${error.message}`);
    // ตอบว่ามี booking ไว้ก่อนเมื่อเช็คไม่ได้ ปลอดภัยกว่าปิดห้องทับคนที่จองไว้
    return true;
  }
};

export const completeExpiredBookings = async () => {
  /* รวมใบที่ยัง approved ด้วย เพราะห้องอาจไม่เคยเปิด (ไม่มีอุปกรณ์ / server ดับ / อนุมัติหลังหมดเวลา)
     ถ้าไม่กวาด ใบพวกนี้จะค้างในแท็บอนุมัติของเจ้าหน้าที่ตลอดไป */
  const query = `
    UPDATE room_booking
    SET status_id = 6,
        action_date = NOW()
    WHERE status_id IN (${BOOKING_LIVE_STATUS_IDS.join(", ")})
      AND "end_dateTime" <= NOW()
    RETURNING id
  `;
  const { rows } = await pool.query(query);
  return rows.map((row) => row.id);
};

export const fetchControllableRoomDevices = async (roomId, deviceTypeKeys) => {
  const query = `
    SELECT rd.id
    FROM room_device rd
    INNER JOIN device_type dt ON rd.device_type_id = dt.id
    WHERE rd.room_id = $1
      AND dt.key = ANY($2::text[])
  `;
  const { rows } = await pool.query(query, [roomId, deviceTypeKeys]);
  return rows.map((row) => row.id);
};

export const fetchPendingBookingSchedules = async (bookingId) => {
  const query = `
    SELECT id AS schedule_id, device_id, action
    FROM iot_schedule
    WHERE booking_id = $1
      AND record_status = 'pending'
  `;
  const { rows } = await pool.query(query, [bookingId]);
  return rows;
};

export const cancelPendingBookingSchedules = async (bookingId) => {
  const query = `
    UPDATE iot_schedule
    SET record_status = 'canceled'
    WHERE booking_id = $1
      AND record_status = 'pending'
  `;
  await pool.query(query, [bookingId]);
};

export const insertBookingSchedules = async ({
  bookingId,
  deviceIds,
  action,
  actionTime,
  actionBy,
}) => {
  const query = `
    INSERT INTO iot_schedule (booking_id, device_id, action, action_time, action_by)
    SELECT $1::bigint, device_id, $3::text, $4::timestamptz, $5::bigint
    FROM unnest($2::bigint[]) AS device_id
    RETURNING id, device_id, action, action_time, action_by
  `;

  const { rows } = await pool.query(query, [
    bookingId,
    deviceIds,
    action,
    actionTime,
    actionBy ?? null,
  ]);

  return rows;
};
