import pool from "../config/db.js";

export const getIotLogs = async ({ limit, offset }) => {
  try {
    const sql = `
    SELECT 
      l.id, 
      l.device_id, 
      l.action, 
      l.action_by, 
      l.action_time, 
      l.created_at,
      dt.type AS device_type_name,
      r.title AS room_title,
      r.floor AS room_floor
    FROM public.iot_log l
    LEFT JOIN public.room_device rd ON l.device_id = rd.id
    LEFT JOIN public.device_type dt ON rd.device_type_id = dt.id
    LEFT JOIN public.room r ON rd.room_id = r.id
    ORDER BY l.action_time DESC
    LIMIT $1 OFFSET $2;
  `;

    const countSql = `SELECT COUNT(*) FROM public.iot_log`;

    const [dataRes, totalRes] = await Promise.all([
      pool.query(sql, [limit ?? 10, offset ?? 0]),
      pool.query(countSql),
    ]);

    return {
      success: true,
      data: dataRes.rows,
      total: parseInt(totalRes.rows[0].count),
    };
  } catch (error) {
    console.error("SQL Error:", error);
    return { success: false, error: "Database query failed" };
  }
};
