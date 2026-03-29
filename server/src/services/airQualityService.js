import pool from "../config/db.js";

const METRIC_MAP = {
  temp: "avg_temp",
  hum: "avg_hum",
  co2: "avg_co2",
  pm25: "avg_pm25",
  pm10: "avg_pm10",
  pm1: "avg_pm1",
  pm03: "avg_pm03",
  co: "avg_co",
  hcho: "avg_hcho",
  tvoc: "avg_tvoc",
};

const PAYLOAD_KEYS = Object.keys(METRIC_MAP);

const numberOrZero = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const finiteValuesForMetric = (readings, payloadKey) => {
  const values = [];
  for (const reading of readings) {
    const raw = reading[payloadKey];
    if (typeof raw === "number" && Number.isFinite(raw)) values.push(raw);
  }
  return values;
};

const readingsIncludeNumericMetric = (readings) =>
  readings.some((reading) =>
    PAYLOAD_KEYS.some(
      (payloadKey) =>
        typeof reading[payloadKey] === "number" &&
        Number.isFinite(reading[payloadKey]),
    ),
  );

const countAqiLevelsInBatch = (readings) => {
  const countsByLevel = {};
  for (const reading of readings) {
    if (typeof reading.aqi !== "string" || reading.aqi.length === 0) continue;
    const level =
      reading.aqi.length > 50 ? reading.aqi.slice(0, 50) : reading.aqi;
    countsByLevel[level] = (countsByLevel[level] || 0) + 1;
  }
  return countsByLevel;
};

const mergeAqiCountMaps = (existingCounts, batchCounts) => {
  const merged =
    existingCounts &&
    typeof existingCounts === "object" &&
    !Array.isArray(existingCounts)
      ? { ...existingCounts }
      : {};
  for (const [level, added] of Object.entries(batchCounts)) {
    merged[level] = numberOrZero(merged[level]) + added;
  }
  return merged;
};

const latestAqiFromReadings = (readings) => {
  for (let index = readings.length - 1; index >= 0; index -= 1) {
    const aqiValue = readings[index]?.aqi;
    if (typeof aqiValue === "string" && aqiValue.length > 0) {
      return aqiValue.length > 50 ? aqiValue.slice(0, 50) : aqiValue;
    }
  }
  return null;
};

const buildMergedRow = (existingRow, readings) => {
  const batchSize = readings.length;
  const hasNumericInBatch = readingsIncludeNumericMetric(readings);
  const priorSampleCount = existingRow
    ? numberOrZero(existingRow.sample_count)
    : 0;
  const mergedSampleCount =
    priorSampleCount + (hasNumericInBatch ? batchSize : 0);

  const row = {};

  for (const [payloadKey, columnName] of Object.entries(METRIC_MAP)) {
    const values = finiteValuesForMetric(readings, payloadKey);
    if (!existingRow) {
      row[columnName] =
        values.length > 0
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : 0;
      continue;
    }

    const priorAverage = numberOrZero(existingRow[columnName]);
    if (!hasNumericInBatch || values.length === 0) {
      row[columnName] = priorAverage;
    } else {
      const batchAverage =
        values.reduce((sum, value) => sum + value, 0) / values.length;
      row[columnName] =
        mergedSampleCount > 0
          ? (priorAverage * priorSampleCount + batchAverage * batchSize) /
            mergedSampleCount
          : batchAverage;
    }
  }

  row.sample_count = mergedSampleCount;

  const latestAqiInBatch = latestAqiFromReadings(readings);
  row.latest_aqi =
    latestAqiInBatch != null
      ? latestAqiInBatch
      : (existingRow?.latest_aqi ?? null);

  row.aqi_counts = mergeAqiCountMaps(
    existingRow?.aqi_counts,
    countAqiLevelsInBatch(readings),
  );

  return row;
};

export const processAirQualityData = (fullId, payload, buffer) => {
  if (!fullId || !payload || typeof payload !== "object") return;

  const row = {};
  for (const payloadKey of PAYLOAD_KEYS) {
    if (payload[payloadKey] === undefined || payload[payloadKey] === null) {
      continue;
    }
    const parsed = parseFloat(payload[payloadKey]);
    if (!Number.isNaN(parsed)) row[payloadKey] = parsed;
  }
  if (typeof payload.aqi === "string" && payload.aqi.length > 0) {
    row.aqi = payload.aqi;
  }

  if (Object.keys(row).length === 0) return;

  if (!buffer[fullId]) buffer[fullId] = [];
  buffer[fullId].push(row);
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

export const upsertAirQualityHourly = async (
  roomDeviceId,
  recordedHour,
  readings,
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const lockResult = await client.query(
      `SELECT
         avg_temp, avg_hum, avg_co2, avg_pm25, avg_pm10, avg_pm1, avg_pm03, avg_co,
         avg_hcho, avg_tvoc,
         sample_count, latest_aqi, aqi_counts
       FROM air_quality_hourly
       WHERE device_id = $1 AND recorded_hour = $2
       FOR UPDATE`,
      [roomDeviceId, recordedHour],
    );
    const mergedRow = buildMergedRow(lockResult.rows[0], readings);
    await client.query(
      `INSERT INTO air_quality_hourly (
         device_id, recorded_hour,
         avg_temp, avg_hum, avg_co2, avg_pm25, avg_pm10, avg_pm1, avg_pm03, avg_co,
         avg_hcho, avg_tvoc,
         sample_count, latest_aqi, aqi_counts, updated_at
       ) VALUES (
         $1, $2,
         $3, $4, $5, $6, $7, $8, $9, $10,
         $11, $12,
         $13, $14, $15::jsonb, NOW()
       )
       ON CONFLICT (device_id, recorded_hour)
       DO UPDATE SET
         avg_temp = EXCLUDED.avg_temp,
         avg_hum = EXCLUDED.avg_hum,
         avg_co2 = EXCLUDED.avg_co2,
         avg_pm25 = EXCLUDED.avg_pm25,
         avg_pm10 = EXCLUDED.avg_pm10,
         avg_pm1 = EXCLUDED.avg_pm1,
         avg_pm03 = EXCLUDED.avg_pm03,
         avg_co = EXCLUDED.avg_co,
         avg_hcho = EXCLUDED.avg_hcho,
         avg_tvoc = EXCLUDED.avg_tvoc,
         sample_count = EXCLUDED.sample_count,
         latest_aqi = EXCLUDED.latest_aqi,
         aqi_counts = EXCLUDED.aqi_counts,
         updated_at = NOW()`,
      [
        roomDeviceId,
        recordedHour,
        mergedRow.avg_temp,
        mergedRow.avg_hum,
        mergedRow.avg_co2,
        mergedRow.avg_pm25,
        mergedRow.avg_pm10,
        mergedRow.avg_pm1,
        mergedRow.avg_pm03,
        mergedRow.avg_co,
        mergedRow.avg_hcho,
        mergedRow.avg_tvoc,
        mergedRow.sample_count,
        mergedRow.latest_aqi,
        mergedRow.aqi_counts,
      ],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const processAirQualityBuffer = async (
  airQualityBuffer,
  deviceCache,
) => {
  const hardwareDeviceIds = Object.keys(airQualityBuffer);
  if (hardwareDeviceIds.length === 0) return;

  const hour = recordedHourUtc();

  for (const hardwareDeviceId of hardwareDeviceIds) {
    const readings = airQualityBuffer[hardwareDeviceId];
    if (!readings || readings.length === 0) continue;

    const mappedDevices = deviceCache.byDeviceId[hardwareDeviceId];
    if (!mappedDevices || mappedDevices.length === 0) {
      airQualityBuffer[hardwareDeviceId] = [];
      continue;
    }

    if (
      !readingsIncludeNumericMetric(readings) &&
      latestAqiFromReadings(readings) == null
    ) {
      airQualityBuffer[hardwareDeviceId] = [];
      continue;
    }

    const roomDeviceId = mappedDevices[0].id;

    try {
      await upsertAirQualityHourly(roomDeviceId, hour, readings);
      airQualityBuffer[hardwareDeviceId] = [];
    } catch (err) {
      console.error(
        `[Error] Air quality hourly upsert failed ID:${roomDeviceId}`,
        err.message,
      );
    }
  }
};
