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
