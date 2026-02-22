import pool from "../config/db.js";

export const WATER_UPSERT_INTERVAL = 1 * 60 * 1000;

export const fetchAllDevicesUsageHistory = async (tableName, days = 7) => {
  const query = `
      SELECT 
        rd.device_id as iot_code,
        r.name as room_label,
        DATE(w.recorded_hour) as usage_date,
        SUM(w.total_usage) as daily_value
      FROM room_device rd
      JOIN rooms r ON rd.room_id = r.id
      JOIN public.${tableName} w ON rd.id = w.device_id
      WHERE w.recorded_hour >= NOW() - INTERVAL '${days} days'
      GROUP BY rd.device_id, r.name, DATE(w.recorded_hour)
      ORDER BY rd.device_id, usage_date ASC;
    `;
  const { rows } = await pool.query(query);
  return rows;
};

export const fetchDailySummary = async (tableName, dbDeviceId) => {
  const query = `
      SELECT 
        SUM(total_usage) as daily_total
      FROM public.${tableName} 
      WHERE device_id = $1 
      AND recorded_hour >= DATE_TRUNC('day', NOW());
    `;
  const { rows } = await pool.query(query, [dbDeviceId]);
  return rows[0];
};

export const upsertWaterHourly = async (
  dbDeviceId,
  usageAmount,
  recordedHour,
) => {
  const query = `
      INSERT INTO public.water_usage_hourly (device_id, total_usage, recorded_hour, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (device_id, recorded_hour) 
      DO UPDATE SET 
        total_usage = public.water_usage_hourly.total_usage + EXCLUDED.total_usage,
        updated_at = NOW();
    `;
  return await pool.query(query, [dbDeviceId, usageAmount, recordedHour]);
};

export const processWaterUsageBuffer = async (waterBuffer, deviceCache) => {
  const deviceKeys = Object.keys(waterBuffer);
  if (deviceKeys.length === 0) return;

  const now = new Date();
  const recordedHour = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    0,
    0,
  );

  for (const iotId of deviceKeys) {
    const valveData = waterBuffer[iotId];

    for (const subKey of ["v1", "v2"]) {
      const readings = valveData[subKey];
      if (!readings || readings.length === 0) continue;

      const avgFlow = readings.reduce((a, b) => a + b, 0) / readings.length;
      const usageInPeriod = avgFlow * (WATER_UPSERT_INTERVAL / (60 * 1000));

      const deviceInfo = deviceCache.byDeviceId[iotId]?.find(
        (d) => d.device_sub_id === subKey,
      );

      if (deviceInfo) {
        const dbId = deviceInfo.id;

        try {
          await upsertWaterHourly(dbId, usageInPeriod, recordedHour);

          waterBuffer[iotId][subKey] = [];
        } catch (err) {
          console.error(`[Error] Upsert failed for ID:${dbId}`, err.message);
        }
      } else {
        console.warn(
          `[Mapping Missing] No ID found for ${iotId} with key ${subKey}`,
        );
      }
    }
  }
};

export const processWaterData = (payload, waterBuffer) => {
  const deviceId = payload.device_id;
  if (!deviceId) return;

  if (!waterBuffer[deviceId]) {
    waterBuffer[deviceId] = { v1: [], v2: [] };
  }

  if (payload.flow_rate_1 !== undefined) {
    waterBuffer[deviceId].v1.push(parseFloat(payload.flow_rate_1));
  }
  if (payload.flow_rate_2 !== undefined) {
    waterBuffer[deviceId].v2.push(parseFloat(payload.flow_rate_2));
  }
};
