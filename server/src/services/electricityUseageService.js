import pool from "../config/db.js";

export const getMetadata = async () => {
  try {
    const floorsRes = await pool.query(`
        SELECT DISTINCT r.floor
        FROM room r
        JOIN room_device rd ON rd.room_id = r.id
        JOIN electricity_useage_hourly euh ON euh.device_id = rd.id
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
        JOIN electricity_useage_hourly euh ON euh.device_id = rd.id
        ORDER BY r.floor, r.id;`,
    );

    const available_rooms = {};
    roomsRes.rows.forEach((room) => {
      if (!available_rooms[room.floor]) {
        available_rooms[room.floor] = [];
      }

      available_rooms[room.floor].push({
        key: room.room_id,
        label: room.title,
      });
    });

    const datesRes = await pool.query(
      `SELECT DISTINCT DATE(recorded_hour) AS date
         FROM electricity_useage_hourly
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

    const measurementUnit = "หน่วย (kWh)";

    return {
      available_floors,
      available_rooms,
      available_dates,
      measurementUnit,
    };
  } catch (err) {
    console.error("getMetadata error:", err);
    throw err;
  }
};

const get7DaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const fetchDailyByRoom = async (floor, room) => {
  try {
    const sevenDaysAgo = get7DaysAgo();

    const query = `
        SELECT 
          r.id AS room_id,
          r.title AS room_title,
          DATE(euh.recorded_hour) AS date,
          SUM(euh.import_kwh) AS import_kwh
        FROM room r
        JOIN room_device rd ON rd.room_id = r.id
        JOIN electricity_useage_hourly euh ON euh.device_id = rd.id
        WHERE r.floor = $1 
          AND r.id = $2
          AND euh.recorded_hour >= $3
        GROUP BY r.id, r.title, DATE(euh.recorded_hour)
        ORDER BY date;
      `;

    const res = await pool.query(query, [floor, room, sevenDaysAgo]);

    const data = {};
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }

    res.rows.forEach((row) => {
      if (!data[row.room_id]) {
        data[row.room_id] = {
          label: row.room_title,
          data: [],
        };
      }

      const dateObj = new Date(row.date);
      dateObj.setHours(dateObj.getHours() + 14);

      const dateStr = dateObj.toISOString().split("T")[0];

      data[row.room_id].data.push({
        date: dateStr,
        value: parseFloat(row.import_kwh) || 0,
      });
    });

    // เติมวันที่ไม่มีข้อมูล
    for (const roomId in data) {
      const existingDates = data[roomId].data.map((d) => d.date);

      last7Days.forEach((d) => {
        if (!existingDates.includes(d)) {
          data[roomId].data.push({ date: d, value: 0 });
        }
      });

      data[roomId].data.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

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
          DATE(euh.recorded_hour) AS date,
          SUM(euh.import_kwh) AS import_kwh
        FROM room r
        JOIN room_device rd ON rd.room_id = r.id
        JOIN electricity_useage_hourly euh ON euh.device_id = rd.id
        WHERE r.floor = $1
          AND euh.recorded_hour >= $2
        GROUP BY r.id, r.title, DATE(euh.recorded_hour)
        ORDER BY r.id, date;
      `;

    const res = await pool.query(query, [floor, sevenDaysAgo]);

    const data = {};
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]); // yyyy-mm-dd
    }

    res.rows.forEach((row) => {
      if (!data[row.room_id]) {
        data[row.room_id] = { label: row.room_title, data: [] };
      }
      const dateObj = new Date(row.date);

      dateObj.setHours(dateObj.getHours() + 14);

      const dateStr = dateObj.toISOString().split("T")[0];

      data[row.room_id].data.push({
        date: dateStr,
        value: parseFloat(row.import_kwh) || 0,
      });
    });

    for (const roomId in data) {
      const existingDates = data[roomId].data.map((d) => d.date);
      last7Days.forEach((d) => {
        if (!existingDates.includes(d)) {
          data[roomId].data.push({ date: d, value: 0 });
        }
      });

      data[roomId].data.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return data;
  } catch (err) {
    console.error("fetchDailyByFloor error:", err);
    throw err;
  }
};

export const fetchHourlyByFloor = async (date, floor) => {
  try {
    const utcTime = new Date(date);

    const thailandTime = new Date(utcTime.getTime() + 7 * 60 * 60 * 1000);

    const dateOnly = new Date(date).toISOString().slice(0, 10);
    const query = `
        SELECT 
          euh.id,
          euh.device_id,
          euh.import_kwh,
          euh.recorded_hour,
          r.id AS room_id,
          r.title AS room_title,
          r.floor
        FROM electricity_useage_hourly euh
        JOIN room_device rd ON rd.id = euh.device_id
        JOIN room r ON r.id = rd.room_id
        WHERE euh.recorded_hour >= $1::date
          AND r.floor = $2
        ORDER BY r.id, euh.recorded_hour;
      `;

    const res = await pool.query(query, [thailandTime, floor]);

    const data = {};
    res.rows.forEach((row) => {
      if (!data[row.room_id]) {
        data[row.room_id] = {
          label: row.room_title,
          data: [],
        };
      }
      data[row.room_id].data.push({
        time: row.recorded_hour,
        value: parseFloat(row.import_kwh) || 0,
      });
    });

    return data;
  } catch (err) {
    console.error("fetchHourlyByFloor error:", err);
    throw err;
  }
};

export const fetchHourlyByRoom = async (date, floor, room_id) => {
  try {
    const query = `
          SELECT 
            euh.id,
            euh.device_id,
            euh.import_kwh,
            euh.recorded_hour,
            r.id AS room_id,
            r.title AS room_title,
            r.floor
          FROM electricity_useage_hourly euh
          JOIN room_device rd ON rd.id = euh.device_id
          JOIN room r ON r.id = rd.room_id
          WHERE euh.recorded_hour >= $1::date
            AND r.floor = $2
            AND r.id = $3
          ORDER BY r.id, euh.recorded_hour;
    `;
    const res = await pool.query(query, [date, floor, room_id]);

    const data = {};

    res.rows.forEach((row) => {
      if (!data[row.room_id]) {
        data[row.room_id] = {
          label: row.room_title,
          data: [],
        };
      }

      data[row.room_id].data.push({
        time: row.recorded_hour,
        value: parseFloat(row.import_kwh) || 0,
      });
    });

    return data;
  } catch (err) {
    console.error("fetchHourlyByRoom error:", err);
    throw err;
  }
};
