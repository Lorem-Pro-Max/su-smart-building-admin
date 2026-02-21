import redisConnection from "../config/redis.js";
import { emitDeviceUpdate } from "./socketService.js";
import { deviceCache } from "./socketService.js";
import { EXECUTION_REGISTRY } from "../utils/controllerWrapper.js";
import { syncIotDevice } from "./socketService.js";

const NOTI_MINUTE_TRIGGER = 20;
const ROOM_SHUTDOWN_MINUTE_TRIGGER = 30;

const ROOM_STATE = {
  NOTIFIED: "notified",
  CLOSED: "closed",
};

const INTERACTABLE_DEVICE_LISTS = new Set([
  "ac",
  "doors",
  "valves",
  "lights",
  "exhaust-fans",
]);

const getFormattedDateTime = () => {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const time = now.toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return { date, time };
};

const deviceIdMap = (sensorId) => {
  const cache = deviceCache.byDeviceId[sensorId];
  if (!cache || Object.keys(cache).length === 0) {
    const err = new Error("[CACHE] Failed to cache device mapping data");
    err.status = 503;
    throw err;
  }
  return Array.isArray(cache) ? cache[0] : cache;
};

const roomDeviceMap = (roomId) => {
  const cache = deviceCache.byRoomId[roomId];
  if (!cache || Object.keys(cache).length === 0) {
    const err = new Error("[CACHE] Failed to cache device mapping data");
    err.status = 503;
    throw err;
  }
  return cache;
};

export const processHumanDetection = async (sensorId, motionStatus) => {
  const now = Date.now();
  const START_TIME_KEY = `occupancy:start:${sensorId}`;
  const LEVEL_KEY = `occupancy:level:${sensorId}`;

  try {
    const isHumanPresent = motionStatus !== "none";

    if (isHumanPresent) {
      await redisConnection.set(START_TIME_KEY, now);
      await redisConnection.del(LEVEL_KEY);
      await handleHumanReentry(sensorId);
      return;
    }

    const startTime = await redisConnection.get(START_TIME_KEY);
    if (!startTime) return await redisConnection.set(START_TIME_KEY, now);

    const idleMinutes = (now - parseInt(startTime)) / 60000;
    const currentLevel = await redisConnection.get(LEVEL_KEY);

    console.log(idleMinutes);

    if (
      idleMinutes >= ROOM_SHUTDOWN_MINUTE_TRIGGER &&
      currentLevel !== ROOM_STATE.CLOSED
    ) {
      await triggerShutdownAction(sensorId);
      await redisConnection.set(LEVEL_KEY, ROOM_STATE.CLOSED);
    } else if (
      idleMinutes >= NOTI_MINUTE_TRIGGER &&
      currentLevel !== ROOM_STATE.NOTIFIED &&
      currentLevel !== ROOM_STATE.CLOSED
    ) {
      const currentTime = getFormattedDateTime();
      await triggerNotiAction(sensorId, currentTime);
      await redisConnection.set(LEVEL_KEY, ROOM_STATE.NOTIFIED);
    }
  } catch (error) {
    console.error(`[Human Detection] FATAL: ${sensorId} | ${error.message}`);
  }
};

const executeRoomAction = async (sensorId, action) => {
  const sensor = deviceIdMap(sensorId);
  const roomDevices = roomDeviceMap(sensor.room_id);

  const grouped = roomDevices.reduce((acc, { type, deviceId, deviceSubId }) => {
    if (INTERACTABLE_DEVICE_LISTS.has(type)) {
      const groupKey = `${type}:${deviceSubId}`;
      acc[groupKey] = acc[groupKey] || { type, subId: deviceSubId, ids: [] };
      acc[groupKey].ids.push(deviceId);
    }
    return acc;
  }, {});

  for (const { type, subId, ids } of Object.values(grouped)) {
    try {
      const execute = EXECUTION_REGISTRY[type] || EXECUTION_REGISTRY.default;
      const results = await execute(type, ids, action, subId);

      const failures = results.filter(
        (r) => !r || r.status !== 200 || r.data?.success !== true,
      );
      failures.forEach((f) => {
        const errMsg = f?.error || f?.data?.message || "Unknown Hardware Error";
        console.error(
          `[Human Detection] API FAILURE: Room ${sensor.room_id} | Type: ${type} | Sub: ${subId} | Error: ${errMsg}`,
        );
      });

      await syncIotDevice(type);
    } catch (e) {
      console.error(`[Human Detection] Execution Error [${type}]:`, e.message);
    }
  }
};

const triggerNotiAction = async (sensorId, datetime) => {
  try {
    const device = deviceIdMap(sensorId);
    if (!device) return;

    emitDeviceUpdate(device.key, {
      title: "แจ้งเตือนการล็อคห้องอัตโนมัติ",
      room: device.title,
      floor: device.floor,
      date: datetime.date,
      time: datetime.time,
      remaining_time: 10,
    });
  } catch (error) {
    console.error(
      `[Human Detection] Noti Error for ${sensorId}:`,
      error.message,
    );
  }
};

const triggerShutdownAction = async (sensorId) => {
  try {
    await executeRoomAction(sensorId, "off");
  } catch (err) {
    console.error(
      `[Human Detection] 30 Minutes Inactivity Shutdown Error for ${sensorId}:`,
      err.message,
    );
  }
};

const handleHumanReentry = async (sensorId) => {
  try {
    await executeRoomAction(sensorId, "on");
  } catch (err) {
    console.error(
      `[Human Detection] Room Re-open Error for ${sensorId}:`,
      err.message,
    );
  }
};

export const isRoomStillInactive = async (sensorId, thresholdMinutes = 30) => {
  const START_TIME_KEY = `occupancy:start:${sensorId}`;
  const startTime = await redisConnection.get(START_TIME_KEY);

  if (!startTime) return false;

  const idleMinutes = (Date.now() - parseInt(startTime)) / 60000;
  return idleMinutes >= thresholdMinutes;
};
