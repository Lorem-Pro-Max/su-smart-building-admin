import pool from "../config/db.js";

export const fetchDeviceMapping = async () => {
  const query = `
    SELECT room_device.device_id, device_type.type, room.title, room.floor
    FROM room_device
    INNER JOIN device_type ON room_device.device_type_id = device_type.id
    INNER JOIN room ON room_device.room_id = room.id
    `;
  const { rows } = await pool.query(query);

  return rows;
};
