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

    const devicesRes = await pool.query(`
      SELECT 
        rd.id AS device_id,
        rd.device_id AS device_label,
        r.floor,
        array_agg(DISTINCT euh.phase) AS phases
      FROM room_device rd
      JOIN room r ON r.id = rd.room_id
      JOIN electricity_useage_hourly euh ON euh.device_id = rd.id
      GROUP BY rd.id, rd.device_id, r.floor
      ORDER BY r.floor, rd.id;
    `);

    const available_devices = {};
    devicesRes.rows.forEach((row) => {
      if (!available_devices[row.floor]) available_devices[row.floor] = [];
      available_devices[row.floor].push({
        key: row.device_id,
        label: row.device_label || `Device ${row.device_id}`,
        phases: row.phases,
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
      available_devices,
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

export const fetchDailyUsage = async ({ floor, device }) => {
  try {
    const sevenDaysAgo = get7DaysAgo();

    let conditions = [];
    let params = [];
    let idx = 1;

    if (floor !== "all") {
      conditions.push(`r.floor = $${idx++}`);
      params.push(floor);
    }

    if (device !== "all") {
      conditions.push(`rd.id = $${idx++}`);
      params.push(device);
    }

    conditions.push(`euh.recorded_hour >= $${idx++}`);
    params.push(sevenDaysAgo);

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const query = `
    SELECT 
      rd.id AS device_id,
      rd.device_id AS device_title,
      DATE(euh.recorded_hour AT TIME ZONE 'Asia/Bangkok') AS date,
      euh.phase,
      SUM(euh.import_kwh) AS total_kwh
    FROM room r
    JOIN room_device rd ON rd.room_id = r.id
    JOIN electricity_useage_hourly euh ON euh.device_id = rd.id
    ${whereClause}
    GROUP BY 
      rd.id,
      rd.device_id,
      DATE(euh.recorded_hour AT TIME ZONE 'Asia/Bangkok'),
      euh.phase
    ORDER BY rd.id, date;
  `;

    const res = await pool.query(query, params);

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }

    const data = {};

    res.rows.forEach((row) => {
      const dateStr = row.date.toISOString().split("T")[0];

      if (!data[row.device_id]) {
        data[row.device_id] = {
          label: row.device_title,
          data: {},
        };
      }

      if (!data[row.device_id].data[dateStr]) {
        data[row.device_id].data[dateStr] = {
          date: dateStr,
        };
      }

      data[row.device_id].data[dateStr][row.phase] =
        parseFloat(row.total_kwh) || 0;
    });

    for (const deviceId in data) {
      last7Days.forEach((date) => {
        if (!data[deviceId].data[date]) {
          data[deviceId].data[date] = {
            date,
          };
        }
      });

      data[deviceId].data = Object.values(data[deviceId].data).sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );
    }

    return data;
  } catch (err) {
    console.error("fetchDailyUsage error:", err);
    throw err;
  }
};

export const fetchHourlyUsage = async (date, floor, device) => {
  try {
    const start = new Date(`${date}T00:00:00`);
    start.setHours(start.getHours() - 7);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setDate(end.getDate() + 1);

    let query = `
      SELECT
        rd.id AS device_id,
        rd.device_id AS device_title,
        euh.recorded_hour,
        euh.phase,
        SUM(euh.import_kwh) AS total_kwh
      FROM electricity_useage_hourly euh
      JOIN room_device rd ON rd.id = euh.device_id
      JOIN room r ON r.id = rd.room_id
      WHERE euh.recorded_hour >= $1
        AND euh.recorded_hour < $2
    `;

    const params = [start.toISOString(), end.toISOString()];
    let paramIndex = 3;

    if (floor !== "all") {
      query += ` AND r.floor = $${paramIndex}`;
      params.push(floor);
      paramIndex++;
    }

    if (device !== "all") {
      query += ` AND rd.id = $${paramIndex}`;
      params.push(device);
      paramIndex++;
    }

    query += `
      GROUP BY rd.id, r.title, euh.recorded_hour, euh.phase
      ORDER BY rd.id, euh.recorded_hour;
    `;

    const result = await pool.query(query, params);

    const data = {};

    for (const row of result.rows) {
      const deviceId = row.device_id;
      const time = row.recorded_hour;
      const phase = row.phase;
      const value = parseFloat(row.total_kwh) || 0;

      if (!data[deviceId]) {
        data[deviceId] = {
          label: row.device_title,
          data: [],
        };
      }

      let existing = data[deviceId].data.find(
        (d) => new Date(d.time).getTime() === new Date(time).getTime(),
      );

      if (!existing) {
        existing = { time };
        data[deviceId].data.push(existing);
      }

      existing[phase] = value;
    }

    return data;
  } catch (err) {
    console.error("fetchHourlyUsage error:", err);
    throw err;
  }
};
