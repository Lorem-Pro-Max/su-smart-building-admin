import pool from "../config/db.js";
import { addIotJob, removeIotJob } from "../services/deviceQueueService.js";

export const getAll = async () => {
  const query = `
  SELECT 
    s.id,
    s.booking_id,
    s.action,
    s.action_time,
    u.id AS user_id,
    u.firstname,
    u.lastname,
    rd.id AS room_device_id,
    rd.device_id,
    rd.room_id,
    dt.type,
    dt.key AS type_key,
    r.id AS room_id,
    r.title,
    r.floor
  FROM iot_schedule s
  LEFT JOIN "user" u 
    ON s.action_by = u.id
  INNER JOIN room_device rd 
    ON s.device_id = rd.id
  INNER JOIN device_type dt ON rd.device_type_id = dt.id
  INNER JOIN room r ON rd.room_id = r.id
`;
  const { rows } = await pool.query(query);

  if (!rows.length) return [];

  const grouped = {};

  for (const item of rows) {
    const roomId = item.room_id;

    if (!grouped[roomId]) {
      grouped[roomId] = {
        booking_id: item.booking_id,
        meeting_name: item.title,
        room: {
          id: item.room_id,
          title: item.title,
          floor: item.floor,
        },
        schedules: [],
      };
    }

    grouped[roomId].schedules.push({
      id: item.id,
      booking_id: item.booking_id,
      action: item.action,
      action_time: item.action_time,
      action_by: {
        id: item.user_id,
        firstname: item.firstname,
        lastname: item.lastname,
        full_name: `${item.firstname || ""} ${item.lastname || ""}`.trim(),
      },
      device: {
        id: item.room_device_id,
        device_code: item.device_id,
        type: item.type,
        type_key: item.type_key,
      },
    });
  }

  return Object.values(grouped);
};

export const createSchedules = async ({
  device_ids,
  action,
  action_time,
  action_by,
}) => {
  const values = [];
  const placeholders = device_ids
    .map((deviceId, index) => {
      const base = index * 5;
      values.push(null, deviceId, action, action_time, action_by);
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
    })
    .join(",");

  const query = `
    INSERT INTO iot_schedule (booking_id, device_id, action, action_time, action_by)
    VALUES ${placeholders}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);

  await Promise.all(
    rows.map((item) =>
      addIotJob(
        item.device_id,
        item.action,
        item.action_time,
        item.booking_id ?? null,
        item.id,
        item.action_by
      ),
    ),
  );

  return rows;
};

export const deleteScheduleById = async (idList) => {
  const fetchQuery = `
    SELECT id, device_id, action, booking_id
    FROM iot_schedule
    WHERE id = ANY($1)
  `;

  const { rows } = await pool.query(fetchQuery, [idList]);
  if (!rows.length) return true;

  const deleteQuery = `
    DELETE FROM iot_schedule
    WHERE id = ANY($1)
  `;

  await pool.query(deleteQuery, [idList]);

  await Promise.all(
    rows.map((item) =>
      removeIotJob(
        item.device_id,
        item.action,
        item.booking_id ?? "manual",
        item.id,
      ),
    ),
  );

  return true;
};

export const getRooms = async () => {
  const query = `
    SELECT r.id, r.title, r.floor, r.is_bookable,
           b.id AS building_id,
           b.name AS building_name
    FROM room r
    LEFT JOIN building b ON r.building_id = b.id
    ORDER BY r.floor ASC
  `;

  const { rows } = await pool.query(query);

  const grouped = {};

  for (const room of rows) {
    if (!grouped[room.floor]) grouped[room.floor] = [];

    grouped[room.floor].push({
      id: room.id,
      title: room.title,
      floor: room.floor,
      is_bookable: room.is_bookable,
      building: {
        id: room.building_id,
        name: room.building_name,
      },
    });
  }

  return grouped;
};

export const getRoomById = async (roomId) => {
  const query = `
    SELECT 
      rd.id,
      rd.device_id,
      rd.room_id,
      dt.id AS device_type_id,
      dt.type,
      dt.key,
      r.id AS room_id,
      r.title,
      r.floor,
      r.building_id,
      r.is_bookable
    FROM room_device rd
    INNER JOIN device_type dt ON rd.device_type_id = dt.id
    INNER JOIN room r ON rd.room_id = r.id
    WHERE rd.room_id = $1
  `;

  const { rows } = await pool.query(query, [roomId]);
  return rows;
};

export const getAllRoomByBooking = async () => {
  const roomQuery = `
    SELECT r.id, r.title, r.floor,
           b.id AS building_id,
           b.name AS building_name
    FROM room r
    LEFT JOIN building b ON r.building_id = b.id
  `;

  const deviceQuery = `
    SELECT rd.id, rd.device_id, rd.room_id,
           dt.type, dt.key
    FROM room_device rd
    INNER JOIN device_type dt ON rd.device_type_id = dt.id
  `;

  const { rows: rooms } = await pool.query(roomQuery);
  const { rows: devices } = await pool.query(deviceQuery);

  if (!rooms.length) return {};

  const grouped = {};

  for (const room of rooms) {
    const floor = room.floor ?? 0;
    if (!grouped[floor]) grouped[floor] = [];

    const roomDevices = devices
      .filter((d) => d.room_id === room.id)
      .map((device) => ({
        id: device.id,
        device_code: device.device_id,
        type: device.type,
        type_key: device.key,
      }));

    grouped[floor].push({
      id: room.id,
      title: room.title,
      floor: room.floor,
      building: {
        id: room.building_id,
        name: room.building_name,
      },
      devices: roomDevices,
    });
  }

  return grouped;
};
