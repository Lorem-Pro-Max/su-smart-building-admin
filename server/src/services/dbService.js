import pool from "../config/db.js";

export const fetchDeviceMapping = async () => {
  const query = `
    SELECT room_device.id, 
    room_device.device_id, 
    device_type.type, 
    device_type.key, 
    room.id AS room_id, 
    room.title, 
    room.floor, 
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
    WHERE status_id = 5 
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
