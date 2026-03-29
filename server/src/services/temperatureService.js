import pool from "../config/db.js";

export const processTemperatureData = (fullId, payload, buffer) => {
  if (!fullId) return;

  const raw = payload?.temp;
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return;

  if (!buffer[fullId]) {
    buffer[fullId] = [];
    buffer[fullId].push(value);
  } else {
    buffer[fullId].push(value);
  }
};

const recordedHourUtc = () => {
  const now = new Date();
  return new Date(
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
};

export const upsertTemperatureHourly = async (
  dbDeviceId,
  batchAvg,
  countInBatch,
  recordedHour,
) => {
  const query = `
    INSERT INTO temperature_hourly
      (device_id, recorded_hour, avg_temperature, sample_count, updated_at)
    VALUES ($1, $2, $3::numeric(10, 4), $4, NOW())
    ON CONFLICT (device_id, recorded_hour)
    DO UPDATE SET
      avg_temperature = (
        COALESCE(temperature_hourly.avg_temperature, 0::numeric(10, 4))
          * COALESCE(temperature_hourly.sample_count, 0)::numeric 
        + EXCLUDED.avg_temperature * EXCLUDED.sample_count::numeric
      ) / NULLIF(
        COALESCE(temperature_hourly.sample_count, 0) + EXCLUDED.sample_count,
        0
      )::numeric,
      sample_count = COALESCE(temperature_hourly.sample_count, 0) + EXCLUDED.sample_count,
      updated_at = NOW();
  `;
  return pool.query(query, [dbDeviceId, recordedHour, batchAvg, countInBatch]);
};

export const processTemperatureBuffer = async (
  temperatureBuffer,
  deviceCache,
) => {
  const keys = Object.keys(temperatureBuffer);
  if (keys.length === 0) return;

  const hour = recordedHourUtc();

  for (const iotId of keys) {
    const readings = temperatureBuffer[iotId];
    if (!readings || readings.length === 0) continue;

    const mapped = deviceCache.byDeviceId[iotId];
    if (!mapped || mapped.length === 0) {
      temperatureBuffer[iotId] = [];
      continue;
    }

    const dbId = mapped[0].id;
    const countInBatch = readings.length;
    const batchAvg = readings.reduce((a, b) => a + b, 0) / countInBatch;

    try {
      await upsertTemperatureHourly(dbId, batchAvg, countInBatch, hour);
      temperatureBuffer[iotId] = [];
    } catch (err) {
      console.error(
        `[Error] Temperature hourly upsert failed ID:${dbId}`,
        err.message,
      );
    }
  }
};
