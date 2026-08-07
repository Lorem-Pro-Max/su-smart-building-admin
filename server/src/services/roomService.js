import pool from "../config/db.js";

function splitLeftRight(rooms) {
  const n = rooms.length;
  if (n === 0) return { left: [], right: [] };
  const leftCount = Math.ceil(n / 2);
  return {
    left: rooms.slice(0, leftCount),
    right: rooms.slice(leftCount),
  };
}


export const getRoomsByFloorForDirectory = async (buildingId = null) => {
  let query = `
    SELECT
      r.id,
      r.title,
      r.floor,
      r.is_bookable,
      r.building_id,
      b.name AS building_name
    FROM room r
    LEFT JOIN building b ON r.building_id = b.id
  `;
  const params = [];
  if (buildingId != null && buildingId !== "") {
    query += ` WHERE r.building_id = $1`;
    params.push(Number(buildingId));
  }
  query += `
    ORDER BY r.floor ASC NULLS LAST, r.title ASC NULLS LAST, r.id ASC
  `;

  const { rows } = await pool.query(query, params);

  const byFloor = {};
  for (const row of rows) {
    const f = row.floor != null ? Number(row.floor) : 0;
    if (!byFloor[f]) byFloor[f] = [];
    byFloor[f].push({
      id: row.id,
      title: row.title,
      floor: row.floor,
      is_bookable: row.is_bookable,
      building_id: row.building_id,
      building_name: row.building_name,
    });
  }

  return Object.keys(byFloor)
    .map(Number)
    .sort((a, b) => a - b)
    .map((floor) => {
      const rooms = byFloor[floor];
      const { left, right } = splitLeftRight(rooms);
      return { floor, left, right };
    });
};

const normalizeTitle = (title) => {
  const normalized = (title == null ? "" : String(title)).trim();
  return normalized === "" ? null : normalized;
};

const normalizeSeats = (seats) => {
  if (seats == null || seats === "") return null;
  const value = Number(seats);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("จำนวนที่นั่งไม่ถูกต้อง");
  }
  return value;
};

export const getAllRoomsForPicker = async () => {
  const query = `
    SELECT id, title, floor
    FROM room
    ORDER BY floor ASC NULLS LAST, title ASC NULLS LAST, id ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const updateRoom = async (id, fields) => {
  const roomId = Number(id);
  if (!Number.isFinite(roomId) || roomId <= 0) {
    throw new Error("รหัสห้องไม่ถูกต้อง");
  }

  const setClauses = [];
  const params = [];

  if ("title" in fields) {
    params.push(normalizeTitle(fields.title));
    setClauses.push(`title = $${params.length}`);
  }
  if ("study_seats" in fields) {
    params.push(normalizeSeats(fields.study_seats));
    setClauses.push(`study_seats = $${params.length}`);
  }
  if ("exam_seats" in fields) {
    params.push(normalizeSeats(fields.exam_seats));
    setClauses.push(`exam_seats = $${params.length}`);
  }

  if (setClauses.length === 0) {
    throw new Error("ไม่มีข้อมูลที่ต้องการแก้ไข");
  }

  params.push(roomId);

  const query = `
    UPDATE room
    SET ${setClauses.join(", ")}
    WHERE id = $${params.length}
    RETURNING id, title, floor, is_bookable, building_id, study_seats, exam_seats
  `;
  const { rows } = await pool.query(query, params);
  if (!rows.length) return null;
  return rows[0];
};
