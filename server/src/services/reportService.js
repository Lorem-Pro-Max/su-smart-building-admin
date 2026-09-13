import pool from "../config/db.js";

const RANGE_START = `($1::date::timestamp AT TIME ZONE 'Asia/Bangkok')`;
const RANGE_END = `(($2::date + 1)::timestamp AT TIME ZONE 'Asia/Bangkok')`;

const bangkokDate = (column) =>
  `TO_CHAR(${column} AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD')`;

const bangkokHourRange = (column) => `
  TO_CHAR(${column} AT TIME ZONE 'Asia/Bangkok', 'HH24:MI')
  || ' - ' ||
  TO_CHAR((${column} + INTERVAL '1 hour') AT TIME ZONE 'Asia/Bangkok', 'HH24:MI')
`;

const APPROVED_BOOKING_STATUSES = ["approved", "checked-in", "completed"];

export const MAX_REPORT_ROWS = 300000;

export const countReportRows = async ({ sql, values }) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM (${sql}) AS report_rows`,
    values,
  );
  return rows[0].count;
};

export const fetchReportRows = async ({ sql, values }) =>
  (await pool.query(sql, values)).rows;

const DEVICE_LOG_COLUMNS = [
  { header: "วันที่", key: "date" },
  { header: "เวลา", key: "time" },
  { header: "ชั้น", key: "floor" },
  { header: "ห้อง", key: "room_title" },
  { header: "อุปกรณ์", key: "device_code" },
  { header: "สถานะ", key: "action" },
  { header: "ผู้ดำเนินการ", key: "action_by" },
];

const buildDeviceLogsQuery = (deviceKey) => ({ from, to, roomIds }) => ({
  sql: `
    SELECT
      ${bangkokDate("l.action_time")} AS date,
      TO_CHAR(l.action_time AT TIME ZONE 'Asia/Bangkok', 'HH24:MI:SS') AS time,
      r.floor,
      r.title AS room_title,
      rd.device_id AS device_code,
      CASE l.action WHEN 'on' THEN 'เปิด' WHEN 'off' THEN 'ปิด' ELSE l.action END AS action,
      CASE
        WHEN l.action_by IS NULL THEN 'ระบบ'
        ELSE COALESCE(
          NULLIF(CONCAT_WS(' ', u.firstname, u.lastname), ''),
          CONCAT('ผู้ใช้ #', l.action_by)
        )
      END AS action_by
    FROM iot_log l
    JOIN room_device rd ON rd.id = l.device_id
    JOIN device_type dt ON dt.id = rd.device_type_id
    JOIN room r ON r.id = rd.room_id
    LEFT JOIN "user" u ON u.id = l.action_by
    WHERE dt.key = $4
      AND l.action_time >= ${RANGE_START}
      AND l.action_time < ${RANGE_END}
      AND r.id = ANY($3::bigint[])
    ORDER BY l.action_time, r.floor, r.title, rd.device_id
    `,
  values: [from, to, roomIds, deviceKey],
});

const buildAirQualityQuery = ({ from, to, roomIds }) => ({
  sql: `
    SELECT
      ${bangkokDate("aq.recorded_hour")} AS date,
      ${bangkokHourRange("aq.recorded_hour")} AS hour_range,
      r.floor,
      r.title AS room_title,
      ROUND(aq.avg_temp, 2) AS temp,
      ROUND(aq.avg_hum, 2) AS hum,
      ROUND(aq.avg_co2, 2) AS co2,
      ROUND(aq.avg_pm25, 2) AS pm25,
      ROUND(aq.avg_pm10, 2) AS pm10,
      ROUND(aq.avg_pm1, 2) AS pm1,
      ROUND(aq.avg_pm03, 2) AS pm03,
      ROUND(aq.avg_co, 2) AS co,
      ROUND(aq.avg_hcho, 2) AS hcho,
      ROUND(aq.avg_tvoc, 2) AS tvoc
    FROM air_quality_hourly aq
    JOIN room_device rd ON rd.id = aq.device_id
    JOIN room r ON r.id = rd.room_id
    WHERE aq.recorded_hour >= ${RANGE_START}
      AND aq.recorded_hour < ${RANGE_END}
      AND r.id = ANY($3::bigint[])
    ORDER BY aq.recorded_hour, r.floor, r.title
    `,
  values: [from, to, roomIds],
});

const buildWaterUsageQuery = ({ from, to, roomIds }) => ({
  sql: `
    SELECT
      ${bangkokDate("w.recorded_hour")} AS date,
      ${bangkokHourRange("w.recorded_hour")} AS hour_range,
      r.floor,
      r.title AS room_title,
      CONCAT_WS(' ', rd.device_id, rd.key) AS device_code,
      ROUND(w.total_usage, 4) AS total_usage
    FROM valves_useage_hourly w
    JOIN room_device rd ON rd.id = w.device_id
    JOIN room r ON r.id = rd.room_id
    WHERE w.recorded_hour >= ${RANGE_START}
      AND w.recorded_hour < ${RANGE_END}
      AND r.id = ANY($3::bigint[])
    ORDER BY w.recorded_hour, r.floor, r.title, rd.device_id, rd.key
    `,
  values: [from, to, roomIds],
});

const buildElectricityUsageQuery = ({ from, to, roomIds }) => ({
  sql: `
    SELECT
      ${bangkokDate("e.recorded_hour")} AS date,
      ${bangkokHourRange("e.recorded_hour")} AS hour_range,
      r.floor,
      r.title AS room_title,
      rd.device_id AS device_code,
      ROUND(SUM(e.import_kwh) FILTER (WHERE e.phase = 'a'), 4) AS phase_a,
      ROUND(SUM(e.import_kwh) FILTER (WHERE e.phase = 'b'), 4) AS phase_b,
      ROUND(SUM(e.import_kwh) FILTER (WHERE e.phase = 'c'), 4) AS phase_c,
      ROUND(SUM(e.import_kwh), 4) AS total_kwh
    FROM electricity_useage_hourly e
    JOIN room_device rd ON rd.id = e.device_id
    JOIN room r ON r.id = rd.room_id
    WHERE e.recorded_hour >= ${RANGE_START}
      AND e.recorded_hour < ${RANGE_END}
      AND r.id = ANY($3::bigint[])
    GROUP BY e.recorded_hour, r.floor, r.title, rd.id, rd.device_id
    ORDER BY e.recorded_hour, r.floor, r.title, rd.device_id
    `,
  values: [from, to, roomIds],
});

const buildRoomUsageQuery = ({ from, to, roomIds }) => ({
  sql: `
    SELECT
      r.floor,
      r.title AS room_title,
      COUNT(rb.id) AS booking_count,
      ROUND(
        COALESCE(SUM(EXTRACT(EPOCH FROM (rb."end_dateTime" - rb."start_dateTime"))), 0) / 3600,
        2
      ) AS total_hours
    FROM room r
    LEFT JOIN room_booking rb
      ON rb.room_id = r.id
      AND rb.booking_date BETWEEN $1::date AND $2::date
      AND rb.status_id IN (SELECT id FROM booking_status WHERE status = ANY($4::text[]))
    WHERE r.id = ANY($3::bigint[])
    GROUP BY r.id, r.floor, r.title, r.is_bookable
    HAVING r.is_bookable OR COUNT(rb.id) > 0
    ORDER BY r.floor, r.title
    `,
  values: [from, to, roomIds, APPROVED_BOOKING_STATUSES],
});

const buildBookingsQuery = ({ from, to }) => ({
  sql: `
    SELECT
      TO_CHAR(rb.created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI') AS created_at,
      rb.meeting_name,
      TO_CHAR(rb.booking_date, 'YYYY-MM-DD') AS booking_date,
      TO_CHAR(rb."start_dateTime" AT TIME ZONE 'Asia/Bangkok', 'HH24:MI') AS start_time,
      TO_CHAR(rb."end_dateTime" AT TIME ZONE 'Asia/Bangkok', 'HH24:MI') AS end_time,
      ROUND(EXTRACT(EPOCH FROM (rb."end_dateTime" - rb."start_dateTime")) / 3600, 2) AS hours,
      r.floor,
      r.title AS room_title,
      CASE
        WHEN bs.status = 'pending' THEN 'รออนุมัติ'
        WHEN bs.status = ANY($3::text[]) THEN 'อนุมัติ'
        WHEN bs.status = 'rejectedByAdmin' THEN 'ปฏิเสธ'
        WHEN bs.status IN ('canceledByAdmin', 'canceledByUser') THEN 'ยกเลิก'
        ELSE bs.status
      END AS status,
      CONCAT_WS(' ', requester.firstname, requester.lastname) AS requester_name,
      rb.phone,
      bt.name AS booking_type,
      rb.purpose,
      rb.approval_reason,
      CASE WHEN bs.status <> 'pending'
        THEN NULLIF(CONCAT_WS(' ', approver.firstname, approver.lastname), '')
      END AS action_by
    FROM room_booking rb
    JOIN room r ON r.id = rb.room_id
    LEFT JOIN booking_status bs ON bs.id = rb.status_id
    LEFT JOIN booking_type bt ON bt.id = rb.booking_type_id
    LEFT JOIN "user" requester ON requester.id = rb.requester_id
    LEFT JOIN "user" approver ON approver.id = rb.action_by
    WHERE rb.booking_date BETWEEN $1::date AND $2::date
    ORDER BY rb.booking_date, rb."start_dateTime", r.floor, r.title
    `,
  values: [from, to, APPROVED_BOOKING_STATUSES],
});

const deviceLogReport = (deviceKey) => ({
  columns: DEVICE_LOG_COLUMNS,
  buildQuery: buildDeviceLogsQuery(deviceKey),
});

export const REPORTS = {
  doors: deviceLogReport("doors"),
  "exhaust-fans": deviceLogReport("exhaust-fans"),
  lights: deviceLogReport("lights"),
  ac: deviceLogReport("ac"),
  "air-quality": {
    maxRangeMonths: 1,
    columns: [
      { header: "วันที่", key: "date" },
      { header: "ช่วงเวลา", key: "hour_range" },
      { header: "ชั้น", key: "floor" },
      { header: "ห้อง", key: "room_title" },
      { header: "Temp (°C)", key: "temp" },
      { header: "Humidity (%)", key: "hum" },
      { header: "CO2 (ppm)", key: "co2" },
      { header: "PM 2.5 (µg/m³)", key: "pm25" },
      { header: "PM 10 (µg/m³)", key: "pm10" },
      { header: "PM 1 (µg/m³)", key: "pm1" },
      { header: "PM 0.3", key: "pm03" },
      { header: "CO (ppm)", key: "co" },
      { header: "HCHO", key: "hcho" },
      { header: "TVOC", key: "tvoc" },
    ],
    buildQuery: buildAirQualityQuery,
  },
  water: {
    columns: [
      { header: "วันที่", key: "date" },
      { header: "ช่วงเวลา", key: "hour_range" },
      { header: "ชั้น", key: "floor" },
      { header: "ห้อง", key: "room_title" },
      { header: "อุปกรณ์", key: "device_code" },
      { header: "ปริมาณการใช้ (m³)", key: "total_usage" },
    ],
    buildQuery: buildWaterUsageQuery,
  },
  electricity: {
    columns: [
      { header: "วันที่", key: "date" },
      { header: "ช่วงเวลา", key: "hour_range" },
      { header: "ชั้น", key: "floor" },
      { header: "ห้อง", key: "room_title" },
      { header: "มิเตอร์", key: "device_code" },
      { header: "Phase A (kWh)", key: "phase_a" },
      { header: "Phase B (kWh)", key: "phase_b" },
      { header: "Phase C (kWh)", key: "phase_c" },
      { header: "รวม (kWh)", key: "total_kwh" },
    ],
    buildQuery: buildElectricityUsageQuery,
  },
  "room-usage": {
    columns: [
      { header: "ชั้น", key: "floor" },
      { header: "ห้อง", key: "room_title" },
      { header: "จำนวนการจอง (ครั้ง)", key: "booking_count" },
      { header: "ชั่วโมงการใช้ห้อง", key: "total_hours" },
    ],
    buildQuery: buildRoomUsageQuery,
  },
  bookings: {
    columns: [
      { header: "วันที่ทำรายการ", key: "created_at" },
      { header: "ชื่อการเรียน/ประชุม", key: "meeting_name" },
      { header: "วันที่จอง", key: "booking_date" },
      { header: "เวลาเริ่ม", key: "start_time" },
      { header: "เวลาสิ้นสุด", key: "end_time" },
      { header: "จำนวนชั่วโมง", key: "hours" },
      { header: "ชั้น", key: "floor" },
      { header: "ห้อง", key: "room_title" },
      { header: "สถานะ", key: "status" },
      { header: "ชื่อผู้จอง", key: "requester_name" },
      { header: "เบอร์โทร", key: "phone", asText: true },
      { header: "ประเภทการจอง", key: "booking_type" },
      { header: "วัตถุประสงค์", key: "purpose" },
      { header: "เหตุผล", key: "approval_reason" },
      { header: "ผู้อนุมัติ/ปฏิเสธ", key: "action_by" },
    ],
    buildQuery: buildBookingsQuery,
  },
};
