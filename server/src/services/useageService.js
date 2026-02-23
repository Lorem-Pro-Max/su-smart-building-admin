import pool from "../config/db.js";

export const USEAGE_UPSERT_INTERVAL = 60 * 1 * 1000;

// export const fetchAllDevicesUsageHistory = async (tableName, days = 7) => {
//   const query = `
//       SELECT
//         rd.device_id as iot_code,
//         r.name as room_label,
//         DATE(w.recorded_hour) as usage_date,
//         SUM(w.total_usage) as daily_value
//       FROM room_device rd
//       JOIN rooms r ON rd.room_id = r.id
//       JOIN ${tableName}_useage_hourly w ON rd.id = w.device_id
//       WHERE w.recorded_hour >= NOW() - INTERVAL '${days} days'
//       GROUP BY rd.device_id, r.name, DATE(w.recorded_hour)
//       ORDER BY rd.device_id, usage_date ASC;
//     `;
//   const { rows } = await pool.query(query);
//   return rows;
// };

export const fetchDailySummary = async (tableName, dbDeviceId) => {
  const query = `
      SELECT 
        SUM(total_usage) as daily_total
      FROM ${tableName}_useage_hourly
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
      INSERT INTO valves_useage_hourly (device_id, total_usage, recorded_hour, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (device_id, recorded_hour) 
      DO UPDATE SET 
        total_usage = valves_useage_hourly.total_usage + EXCLUDED.total_usage,
        updated_at = NOW();
    `;
  return await pool.query(query, [dbDeviceId, usageAmount, recordedHour]);
};

export const processWaterUsageBuffer = async (waterBuffer, deviceCache) => {
  const deviceKeys = Object.keys(waterBuffer);
  if (deviceKeys.length === 0) return;

  const now = new Date();
  const recordedHour = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      0,
      0,
      0,
    ),
  );

  console.log("water", recordedHour);

  for (const iotId of deviceKeys) {
    const valveData = waterBuffer[iotId];

    for (const subKey of ["v1", "v2"]) {
      const readings = valveData[subKey];
      if (!readings || readings.length === 0) continue;

      const avgFlow = readings.reduce((a, b) => a + b, 0) / readings.length;
      const usageInPeriod = avgFlow * (USEAGE_UPSERT_INTERVAL / (60 * 1000));

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

export const processElecticityData = (payload, deviceId, electricBuffer) => {
  if (!deviceId) return;

  const currentImport = parseFloat(payload.e_import_kwh);
  const currentExport = parseFloat(payload.e_export_kwh);

  if (isNaN(currentImport) || isNaN(currentExport)) return;

  if (!electricBuffer[deviceId]) {
    electricBuffer[deviceId] = {
      previousImport: currentImport,
      previousExport: currentExport,
      hourlyImport: 0,
      hourlyExport: 0,
    };
    return;
  }

  const data = electricBuffer[deviceId];

  const deltaImport = currentImport - data.previousImport;
  const deltaExport = currentExport - data.previousExport;

  // กันค่าติดลบ (กรณี meter reset)
  if (deltaImport > 0) data.hourlyImport += deltaImport;
  if (deltaExport > 0) data.hourlyExport += deltaExport;

  data.previousImport = currentImport;
  data.previousExport = currentExport;
};

export const processElectricityUsageBuffer = async (electricityBuffer) => {
  const deviceKeys = Object.keys(electricityBuffer);
  if (deviceKeys.length === 0) return;

  const now = new Date();
  const recordedHour = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      0,
      0,
      0,
    ),
  );

  console.log("elec", recordedHour);

  for (const deviceId of deviceKeys) {
    const data = electricityBuffer[deviceId];

    data.hourlyImport += data.lastImport || 0;
    data.hourlyExport += data.lastExport || 0;

    if (data.hourlyImport === 0 && data.hourlyExport === 0) continue;

    try {
      await upsertElectricityHourly(
        deviceId,
        data.hourlyImport,
        data.hourlyExport,
        recordedHour,
      );

      data.hourlyImport = 0;
      data.hourlyExport = 0;
    } catch (err) {
      console.error(
        `[Error] Electricity upsert failed ID:${deviceId}`,
        err.message,
      );
    }
  }
};

export const upsertElectricityHourly = async (
  dbDeviceId,
  importAmount,
  exportAmount,
  recordedHour,
) => {
  const query = `
    INSERT INTO electric_usage_hourly
    (device_id, import_kwh, export_kwh, recorded_hour, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (device_id, recorded_hour)
    DO UPDATE SET
      import_kwh = electric_usage_hourly.import_kwh + EXCLUDED.import_kwh,
      export_kwh = electric_usage_hourly.export_kwh + EXCLUDED.export_kwh,
      updated_at = NOW();
  `;

  return await pool.query(query, [
    dbDeviceId,
    importAmount,
    exportAmount,
    recordedHour,
  ]);
};
