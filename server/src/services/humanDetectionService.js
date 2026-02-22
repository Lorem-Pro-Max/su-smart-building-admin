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

const errorThrottles = new Map();
const ERROR_LOG_INTERVAL = 60000;

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

  const sensorMappings = getDeviceByHardwareId(sensorId);

  if (!sensorMappings || sensorMappings.length === 0) return;

  const now = Date.now();
  const isHumanPresent = motionStatus !== "none";

  for (const meta of sensorMappings) {
    const roomId = meta.room_id;
    const START_TIME_KEY = `occupancy:start:${sensorId}:${roomId}`;
    const LEVEL_KEY = `occupancy:level:${sensorId}:${roomId}`;

    try {
      if (isHumanPresent) {
        await redisConnection.set(START_TIME_KEY, now);
        const currentLevel = await redisConnection.get(LEVEL_KEY);

        if (
          currentLevel === ROOM_STATE.CLOSED ||
          currentLevel === ROOM_STATE.NOTIFIED
        ) {
          await handleHumanReentry(roomId);
        }
        await redisConnection.del(LEVEL_KEY);
        continue;
      }

      const startTime = await redisConnection.get(START_TIME_KEY);
      if (!startTime) {
        await redisConnection.set(START_TIME_KEY, now);
        continue;
      }

      const idleMinutes = (now - parseInt(startTime)) / 60000;
      const currentLevel = await redisConnection.get(LEVEL_KEY);

      if (
        idleMinutes >= ROOM_SHUTDOWN_MINUTE_TRIGGER &&
        currentLevel !== ROOM_STATE.CLOSED
      ) {
        await triggerShutdownAction(roomId);
        await redisConnection.set(LEVEL_KEY, ROOM_STATE.CLOSED);
      } else if (idleMinutes >= NOTI_MINUTE_TRIGGER && !currentLevel) {
        const currentTime = getFormattedDateTime();
        await triggerNotiAction(meta, currentTime);
        await redisConnection.set(LEVEL_KEY, ROOM_STATE.NOTIFIED);
      }
    } catch (error) {
      const errorKey = `crash:${sensorId}:${roomId}`;
      const now = Date.now();
      const lastLogged = errorThrottles.get(errorKey) || 0;

      if (now - lastLogged > ERROR_LOG_INTERVAL) {
        errorThrottles.set(errorKey, now);

        logSystemEvent(
          "human-detection",
          "error",
          "DETECTION_CRASH",
          error.message,
          { sensorId, roomId },
        );
      } else {
        console.error(
          `[Human Detection] FATAL: ${sensorId} in ${roomId}: ${error.message}`,
        );
      }
    }
  }
};

const executeRoomAction = async (roomId, action) => {
  try {
    const roomDevices = getDevicesByRoomId(roomId);

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

        const successes = results.filter(
          (r) => r && r.status === 200 && r.data?.success === true,
        );
        const failures = results.filter(
          (r) => !r || r.status !== 200 || r.data?.success !== true,
        );

        successes.forEach((res) => {
          try {
            const deviceMetaList = getDeviceByHardwareId(res.id);
            deviceMetaList.forEach((meta) => {
              if (meta.id && String(meta.room_id) === String(roomId)) {
                logIotAction(meta.id, action, null);
              }
            });
          } catch (mappingErr) {
            logSystemEvent(
              "human-detection",
              "warn",
              "LOG_MAPPING_MISS",
              res.id,
            );
          }
        });

        if (failures.length > 0) {
          const failKey = `partial-fail:${roomId}:${type}`;
          const now = Date.now();
          if (now - (errorThrottles.get(failKey) || 0) > ERROR_LOG_INTERVAL) {
            errorThrottles.set(failKey, now);
            logSystemEvent(
              "human-detection",
              "warn",
              "PARTIAL_EXECUTION_FAIL",
              `Some ${type} failed.`,
              { failures },
            );
          }
        }

        await syncIotDevice(type);
      } catch (e) {
        const errorKey = `exec-critical:${roomId}`;
        const now = Date.now();
        if (now - (errorThrottles.get(errorKey) || 0) > ERROR_LOG_INTERVAL) {
          errorThrottles.set(errorKey, now);
          logSystemEvent(
            "human-detection",
            "error",
            "EXECUTION_CRITICAL",
            e.message,
          );
        } else {
          console.error(`[Human Detection] CRITICAL: ${roomId}: ${e.message}`);
        }
      }
    }
  } catch (error) {
    logSystemEvent("human-detection", "error", "ROOM_MAP_FAIL", error.message, {
      roomId,
    });
  }
};

const triggerNotiAction = async (meta, datetime) => {
  try {
    const io = getIO();
    io.emit("idle_warning", {
      title: "แจ้งเตือนการล็อคห้องอัตโนมัติ",
      room: meta.title,
      floor: meta.floor,
      date: datetime.date,
      time: datetime.time,
      remaining_time: 10,
    });
  } catch (error) {
    console.warn(
      `[Noti Warning] Socket failed to emit warning for ${meta.title}: ${error.message}`,
    );
  }
};

const triggerShutdownAction = async (roomId) => {
  await executeRoomAction(roomId, "off");
};

const handleHumanReentry = async (roomId) => {
  await executeRoomAction(roomId, "on");
};

export const isRoomStillInactive = async (roomId, thresholdMinutes = 30) => {
  const sensorIds = getSensorsByRoomId(roomId);
  if (sensorIds.length === 0) return true;

  const results = await Promise.all(
    sensorIds.map(async (id) => {
      const startTime = await redisConnection.get(
        `occupancy:start:${id}:${roomId}`,
      );
      if (!startTime) return true;

      const idleMinutes = (Date.now() - parseInt(startTime)) / 60000;
      return idleMinutes >= thresholdMinutes;
    }),
  );

  return results.every((status) => status === true);
};
