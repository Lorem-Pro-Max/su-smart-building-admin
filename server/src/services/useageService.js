import pool from "../config/db.js";

export const USEAGE_UPSERT_INTERVAL = 60 * 1 * 1000;

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

  for (const iotId of deviceKeys) {
    const valveData = waterBuffer[iotId];

    for (const subKey of ["v1", "v2"]) {
      const readings = valveData[subKey];
      if (!readings || readings.length === 0) continue;

      const avgFlow = readings.reduce((a, b) => a + b, 0) / readings.length;
      const usageInPeriod =
        (avgFlow * (USEAGE_UPSERT_INTERVAL / (60 * 1000))) / 1000;

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

  const phases = ["a", "b", "c"];
  if (!electricBuffer[deviceId]) electricBuffer[deviceId] = {};

  phases.forEach((phase) => {
    const importKey = `e${phase}_import_kwh`;
    const exportKey = `e${phase}_export_kwh`;

    const currentImport = parseFloat(payload[importKey]);
    const currentExport = parseFloat(payload[exportKey]);

    if (isNaN(currentImport) || isNaN(currentExport)) return;

    if (!electricBuffer[deviceId][phase]) {
      electricBuffer[deviceId][phase] = {
        previousImport: currentImport,
        previousExport: currentExport,
        hourlyImport: 0,
        hourlyExport: 0,
      };
      return;
    }

    const data = electricBuffer[deviceId][phase];

    const deltaImport = currentImport - data.previousImport;
    const deltaExport = currentExport - data.previousExport;

    if (deltaImport > 0) data.hourlyImport += deltaImport;
    if (deltaExport > 0) data.hourlyExport += deltaExport;

    data.previousImport = currentImport;
    data.previousExport = currentExport;
  });
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

  for (const deviceId of deviceKeys) {
    const deviceData = electricityBuffer[deviceId];
    if (!deviceData) continue;

    const phases = ["a", "b", "c"];
    for (const phase of phases) {
      const data = deviceData[phase];
      if (!data) continue;

      data.hourlyImport += data.lastImport || 0;
      data.hourlyExport += data.lastExport || 0;

      if (data.hourlyImport === 0 && data.hourlyExport === 0) continue;

      try {
        await upsertElectricityHourly(
          deviceId,
          data.hourlyImport,
          data.hourlyExport,
          recordedHour,
          phase,
        );

        data.hourlyImport = 0;
        data.hourlyExport = 0;
      } catch (err) {
        console.error(
          `[Error] Electricity upsert failed ID:${deviceId} Phase:${phase}`,
          err.message,
        );
      }
    }
  }
};

export const upsertElectricityHourly = async (
  dbDeviceId,
  importAmount,
  exportAmount,
  recordedHour,
  phase,
) => {
  const query = `
    INSERT INTO electricity_useage_hourly
      (device_id, import_kwh, export_kwh, recorded_hour, phase, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (device_id, recorded_hour, phase)
    DO UPDATE SET
      import_kwh = electricity_useage_hourly.import_kwh + EXCLUDED.import_kwh,
      export_kwh = electricity_useage_hourly.export_kwh + EXCLUDED.export_kwh,
      updated_at = NOW();
  `;

  return await pool.query(query, [
    dbDeviceId,
    importAmount,
    exportAmount,
    recordedHour,
    phase,
  ]);
};
