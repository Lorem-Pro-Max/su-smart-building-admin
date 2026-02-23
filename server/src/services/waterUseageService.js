import pool from "../config/db.js";

export const getMetadata = async () => {
  try {
    const floorsRes = await pool.query(`
        SELECT DISTINCT r.floor
        FROM room r
        JOIN room_device rd ON rd.room_id = r.id
        JOIN valves_useage_hourly vuh ON vuh.device_id = rd.id
        ORDER BY r.floor
      `);
    const available_floors = floorsRes.rows.map((f) => ({
      key: f.floor,
      label: `ชั้น ${f.floor}`,
    }));

    const roomsRes = await pool.query(
      `SELECT DISTINCT r.id AS room_id,
                r.floor,
                r.title
        FROM room r
        JOIN room_device rd ON rd.room_id = r.id
        JOIN valves_useage_hourly vuh ON vuh.device_id = rd.id
        ORDER BY r.floor, r.id;`,
    );

    const available_rooms = {};
    roomsRes.rows.forEach((room) => {
      if (!available_rooms[room.floor]) {
        available_rooms[room.floor] = [];
        available_rooms[room.floor].push({
          key: room.room_id,
          label: room.title,
        });
      }
    });

    const datesRes = await pool.query(
      `SELECT DISTINCT DATE(recorded_hour) AS date
         FROM valves_useage_hourly
         ORDER BY date DESC
         LIMIT 30`,
    );
    const available_dates = datesRes.rows.map((d) => ({
      key: d.date,
      label: d.date.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
    }));

    const measurement_unit = "m³/s";

    return {
      available_floors,
      available_rooms,
      available_dates,
      measurement_unit,
    };
  } catch (err) {
    console.error("getMetadata error:", err);
    throw err;
  }
};

const get7DaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString(); // yyyy-mm-ddTHH:mm:ss.sssZ
};

export const fetchDailyByRoom = async (floor, room) => {
  try {
    const sevenDaysAgo = get7DaysAgo();

    const query = `
        SELECT 
          r.id AS room_id,
          r.title AS room_title,
          SUM(vuh.total_usage) AS total_usage
        FROM room r
        JOIN room_device rd ON rd.room_id = r.id
        JOIN valves_useage_hourly vuh ON vuh.device_id = rd.id
        WHERE r.floor = $1 
            AND r.id = $2
            AND vuh.recorded_hour >= $3
        GROUP BY r.id, r.title
        ORDER BY r.id
      `;
    const res = await pool.query(query, [floor, room, sevenDaysAgo]);

    const data = {};
    res.rows.forEach((row) => {
      data[row.room_id] = {
        room_title: row.room_title,
        total_usage: parseFloat(row.total_usage) || 0,
      };
    });

    return data;
  } catch (err) {
    console.error("fetchDailyByRoom error:", err);
    throw err;
  }
};

export const fetchDailyByFloor = async (floor) => {
  try {
    const sevenDaysAgo = get7DaysAgo();

    const query = `
        SELECT 
        r.id AS room_id,
        r.title AS room_title,
        SUM(vuh.total_usage) AS total_usage
        FROM room r
        JOIN room_device rd ON rd.room_id = r.id
        JOIN valves_useage_hourly vuh ON vuh.device_id = rd.id
        WHERE r.floor = $1
            AND vuh.recorded_hour >= $2
        GROUP BY r.id, r.title
        ORDER BY r.id;
      `;
    const res = await pool.query(query, [floor, sevenDaysAgo]);

    const data = {};
    res.rows.forEach((row) => {
      data[row.room_id] = {
        room_title: row.room_title,
        total_usage: parseFloat(row.total_usage) || 0,
      };
    });

    return data;
  } catch (err) {
    console.error("fetchDailyByFloor error:", err);
    throw err;
  }
};

export const fetchHourlyAll = async (date) => {
  try {
    console.log(date);
    const query = `
            SELECT 
            r.id AS room_id,
            r.title AS room_title,
            TO_CHAR(vuh.recorded_hour, 'HH24:MI') AS hour,
            SUM(vuh.total_usage) AS total_usage
            FROM room r
            JOIN room_device rd ON rd.room_id = r.id
            JOIN valves_useage_hourly vuh ON vuh.device_id = rd.id
            WHERE DATE(vuh.recorded_hour) = $1
            GROUP BY r.id, r.title, hour
            ORDER BY r.id, hour;
        `;
    const res = await pool.query(query, [date]);

    const data = {};
    res.rows.forEach((row) => {
      data[row.room_id] = {
        room_title: row.room_title,
        total_usage: parseFloat(row.total_usage) || 0,
      };
    });

    return data;
  } catch (err) {
    console.error("fetchDailyByFloor error:", err);
    throw err;
  }
};

export const fetchHourlyByFloor = async (date, floor) => {
  try {
    console.log(date);
    const query = `
                SELECT 
                r.id AS room_id,
                r.title AS room_title,
                TO_CHAR(vuh.recorded_hour, 'HH24:MI') AS hour,
                SUM(vuh.total_usage) AS total_usage
                FROM room r
                JOIN room_device rd ON rd.room_id = r.id
                JOIN valves_useage_hourly vuh ON vuh.device_id = rd.id
                WHERE DATE(vuh.recorded_hour) = $1
                AND r.floor = $2
                GROUP BY r.id, r.title, hour
                ORDER BY r.id, hour;
          `;
    const res = await pool.query(query, [date, floor]);

    const data = {};
    res.rows.forEach((row) => {
      data[row.room_id] = {
        room_title: row.room_title,
        total_usage: parseFloat(row.total_usage) || 0,
      };
    });

    return data;
  } catch (err) {
    console.error("fetchDailyByFloor error:", err);
    throw err;
  }
};

export const fetchHourlyByRoom = async (date, floor, room_id) => {
  try {
    console.log(date);
    const query = `
            SELECT 
            r.id AS room_id,
            r.title AS room_title,
            TO_CHAR(vuh.recorded_hour, 'HH24:MI') AS hour,
            SUM(vuh.total_usage) AS total_usage
            FROM room r
            JOIN room_device rd ON rd.room_id = r.id
            JOIN valves_useage_hourly vuh ON vuh.device_id = rd.id
            WHERE DATE(vuh.recorded_hour) = $1
            AND r.floor = $2
            AND r.id = $3
            GROUP BY r.id, r.title, hour
            ORDER BY r.id, hour;
            `;
    const res = await pool.query(query, [date, floor, room_id]);

    const data = {};
    res.rows.forEach((row) => {
      data[row.room_id] = {
        room_title: row.room_title,
        total_usage: parseFloat(row.total_usage) || 0,
      };
    });

    return data;
  } catch (err) {
    console.error("fetchDailyByFloor error:", err);
    throw err;
  }
};
