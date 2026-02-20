import pool from "../config/db.js";

export const fetchDeviceMapping = async () => {
  const query = `
    SELECT room_device.id, room_device.device_id, device_type.type, device_type.key, room.title, room.floor, room_device.key AS device_sub_id
    FROM room_device
    INNER JOIN device_type ON room_device.device_type_id = device_type.id
    INNER JOIN room ON room_device.room_id = room.id
    `;
  const { rows } = await pool.query(query);

  return rows;
};
