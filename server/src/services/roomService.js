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

/**
 * ดึงห้องจากตาราง room จัดกลุ่มตามชั้น แบ่งคอลัมน์ซ้าย/ขวา
 * (จำนวนครึ่งแรกปัดขึ้น — เช่น 11 ห้อง = ซ้าย 6 ขวา 5)
 */
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
