import redisConnection from "../config/redis.js";
import { syncIotDevice } from "./socketService.js";
import { EXECUTION_REGISTRY } from "../utils/controllerWrapper.js";
import { logSystemEvent, logIotAction } from "./dbService.js";
import { getIO } from "../config/socket.js";
import {
  getDeviceByHardwareId,
  getDevicesByRoomId,
  getSensorsByRoomId,
} from "../utils/deviceMap.js";

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

export const processHumanDetection = async (sensorId, motionStatus) => {
  if (!sensorId) return;

  const now = Date.now();
  const START_TIME_KEY = `occupancy:start:${sensorId}`;
  const LEVEL_KEY = `occupancy:level:${sensorId}`;

  try {
    const isHumanPresent = motionStatus !== "none";

    if (isHumanPresent) {
      await redisConnection.set(START_TIME_KEY, now);

      const currentLevel = await redisConnection.get(LEVEL_KEY);
      if (
        currentLevel === ROOM_STATE.CLOSED ||
        currentLevel === ROOM_STATE.NOTIFIED
      ) {
        logSystemEvent(
          "human-detection",
          "info",
          "AUTO_REOPEN",
          `Motion detected by ${sensorId}; restoring room power.`,
        );
        await handleHumanReentry(sensorId);
      }

      await redisConnection.del(LEVEL_KEY);
      return;
    }

    const startTime = await redisConnection.get(START_TIME_KEY);
    if (!startTime) return await redisConnection.set(START_TIME_KEY, now);

    const idleMinutes = (now - parseInt(startTime)) / 60000;
    const currentLevel = await redisConnection.get(LEVEL_KEY);

    if (
      idleMinutes >= ROOM_SHUTDOWN_MINUTE_TRIGGER &&
      currentLevel !== ROOM_STATE.CLOSED
    ) {
      logSystemEvent(
        "human-detection",
        "info",
        "AUTO_SHUTDOWN",
        `Room idle for ${ROOM_SHUTDOWN_MINUTE_TRIGGER}m. Executing shutdown.`,
        { sensorId },
      );
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
    logSystemEvent(
      "human-detection",
      "error",
      "DETECTION_CRASH",
      error.message,
      { sensorId },
    );
  }
};

const executeRoomAction = async (sensorId, action) => {
  try {
    const sensor = getDeviceByHardwareId(sensorId);
    if (!sensor) throw new Error(`Sensor ${sensorId} not found in cache`);

    const roomDevices = getDevicesByRoomId(sensor.room_id);

    const grouped = roomDevices.reduce(
      (acc, { type, deviceId, deviceSubId }) => {
        if (INTERACTABLE_DEVICE_LISTS.has(type)) {
          const groupKey = `${type}:${deviceSubId}`;
          acc[groupKey] = acc[groupKey] || {
            type,
            subId: deviceSubId,
            ids: [],
          };
          acc[groupKey].ids.push(deviceId);
        }
        return acc;
      },
      {},
    );

    for (const { type, subId, ids } of Object.values(grouped)) {
      try {
        const execute = EXECUTION_REGISTRY[type] || EXECUTION_REGISTRY.default;
        const results = await execute(type, ids, action, subId);

        const failures = [];
        const successes = [];

        results.forEach((r) => {
          if (!r || r.status !== 200 || r.data?.success !== true) {
            failures.push(r);
          } else {
            successes.push(r);
          }
        });

        successes.forEach((res) => {
          try {
            const deviceMeta = getDeviceByHardwareId(res.id);

            if (deviceMeta && deviceMeta.id) {
              logIotAction(deviceMeta.id, action, 1);
            }
          } catch (mappingErr) {
            logSystemEvent(
              "human-detection",
              "warn",
              "LOG_MAPPING_MISS",
              `Hardware ID ${res.id} missing from cache.`,
            );
          }
        });

        if (failures.length > 0) {
          logSystemEvent(
            "human-detection",
            "warn",
            "PARTIAL_EXECUTION_FAIL",
            `Action ${action} failed for some ${type}`,
            { failures },
          );
        }

        await syncIotDevice(type);
      } catch (e) {
        logSystemEvent(
          "human-detection",
          "error",
          "EXECUTION_CRITICAL",
          `Critical failure on ${type}: ${e.message}`,
        );
      }
    }
  } catch (error) {
    logSystemEvent("human-detection", "error", "ROOM_MAP_FAIL", error.message, {
      sensorId,
    });
  }
};

const triggerNotiAction = async (sensorId, datetime) => {
  try {
    const device = getDeviceByHardwareId(sensorId);
    if (!device) return;

    const io = getIO();

    io.emit("idle_warning", {
      title: "แจ้งเตือนการล็อคห้องอัตโนมัติ",
      room: device.title,
      floor: device.floor,
      date: datetime.date,
      time: datetime.time,
      remaining_time: 10,
    });
  } catch (error) {
    logSystemEvent("human-detection", "warn", "NOTI_SEND_FAIL", error.message, {
      sensorId,
    });
  }
};

const triggerShutdownAction = async (sensorId) => {
  await executeRoomAction(sensorId, "off");
};

const handleHumanReentry = async (sensorId) => {
  await executeRoomAction(sensorId, "on");
};

export const isRoomStillInactive = async (roomId, thresholdMinutes = 30) => {
  const sensorIds = getSensorsByRoomId(roomId);

  if (sensorIds.length === 0) return true;

  const results = await Promise.all(
    sensorIds.map(async (id) => {
      const startTime = await redisConnection.get(`occupancy:start:${id}`);
      if (!startTime) return true;

      const idleMinutes = (Date.now() - parseInt(startTime)) / 60000;
      return idleMinutes >= thresholdMinutes;
    }),
  );

  return results.every((status) => status === true);
};
