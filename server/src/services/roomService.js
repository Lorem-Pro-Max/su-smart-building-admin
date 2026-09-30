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

export const getBookableRooms = async () => {
  const query = `
    SELECT
      r.id,
      r.title,
      r.floor,
      r.building_id,
      b.name AS building_name,
      r.study_seats,
      r.exam_seats
    FROM room r
    LEFT JOIN building b ON b.id = r.building_id
    WHERE r.is_bookable = true
    ORDER BY r.title ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const TOTAL_SLOTS_PER_ROOM = 26;
const SECONDS_PER_SLOT = 1800; // 30 นาทีต่อ 1 slot

/* % ห้องว่างรายวัน ใช้ระบายสีปฏิทินในหน้าสร้างการจอง */
export const getBuildingAvailabilityByDateRange = async (
  startDate,
  endDate,
) => {
  const query = `
    WITH date_series AS (
      SELECT generate_series($1::date, $2::date, interval '1 day')::date AS booking_date
    ),
    room_count AS (
      SELECT count(*)::int AS total_rooms
      FROM room
      WHERE is_bookable = true
    ),
    used_slot_per_day AS (
      SELECT
        booking_date,
        SUM(
          EXTRACT(EPOCH FROM ("end_dateTime" - "start_dateTime")) / ${SECONDS_PER_SLOT}
        )::int AS used_slots
      FROM room_booking
      WHERE booking_date BETWEEN $1::date AND $2::date
        AND status_id IN (2, 5, 6)
      GROUP BY booking_date
    )
    SELECT
      ds.booking_date,
      round(
        (
          (rc.total_rooms * ${TOTAL_SLOTS_PER_ROOM} - coalesce(usd.used_slots, 0))::numeric
          / nullif((rc.total_rooms * ${TOTAL_SLOTS_PER_ROOM}), 0)
        ) * 100,
        2
      ) AS available_percent
    FROM date_series ds
    CROSS JOIN room_count rc
    LEFT JOIN used_slot_per_day usd ON usd.booking_date = ds.booking_date
    ORDER BY ds.booking_date
  `;
  const { rows } = await pool.query(query, [startDate, endDate]);
  return rows;
};
