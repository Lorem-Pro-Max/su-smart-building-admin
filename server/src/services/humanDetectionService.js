import redisConnection from "../config/redis.js";
import { syncIotDevice } from "./socketService.js";
import { EXECUTION_REGISTRY } from "../utils/controllerWrapper.js";
import { logSystemEvent, logIotAction, logHpsStatus } from "./dbService.js";
import { getIO } from "../config/socket.js";
import {
  getDeviceByHardwareId,
  getDevicesByRoomId,
} from "../utils/deviceMap.js";

const NOTI_MINUTE_TRIGGER = 20;
const ROOM_SHUTDOWN_MINUTE_TRIGGER = 30;

const ROOM_STATE = {
  NOTIFIED: "notified",
  CLOSED: "closed",
};

const INTERACTABLE_DEVICE_LISTS = new Set([
  "ac",
  // "doors",
  "valves",
  "lights",
  "exhaust-fans",
]);

const errorThrottles = new Map();
const ERROR_LOG_INTERVAL = 60000;

const getFormattedDateTime = () => {
  const now = new Date();

  const dateOptions = {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  };

  const timeOptions = {
    timeZone: "Asia/Bangkok",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const date = now.toLocaleDateString("en-GB", dateOptions);
  const time = now.toLocaleTimeString("en-GB", timeOptions);

  return { date, time };
};

export const processHumanDetection = async (sensorId, motionStatus) => {
  if (!sensorId) return;

  const sensorMappings = getDeviceByHardwareId(sensorId);
  if (!sensorMappings || sensorMappings.length === 0) return;

  const now = Date.now();
  const isHumanPresent = motionStatus !== "none";
  const currentStatus = isHumanPresent ? "detected" : "none";

  for (const meta of sensorMappings) {
    await syncHpsStatusLog(meta.id, currentStatus);

    const roomId = meta.room_id;
    const START_TIME_KEY = `occupancy:start:room:${roomId}`;
    const LEVEL_KEY = `occupancy:level:room:${roomId}`;
    const LOCK_KEY = `proc:lock:${roomId}`;
    const BOOKING_KEY = `booking:active:room:${roomId}`;

    try {
      const isRoomBooked = await redisConnection.get(BOOKING_KEY);

      if (isHumanPresent) {
        // const prevStart = await redisConnection.get(START_TIME_KEY);
        // if (prevStart) {
        //   const idleMins = (now - parseInt(prevStart)) / 60000;
        //   if (idleMins >= 3) {
        //     logSystemEvent(
        //       "human-detection",
        //       "info",
        //       "MOTION_RETURN",
        //       `Motion detected. Resetting timer after ${idleMins.toFixed(2)} mins idle.`,
        //       { roomId, sensorId, idleMins },
        //     );
        //   }
        // }

        await redisConnection.set(START_TIME_KEY, now);
        const currentLevel = await redisConnection.get(LEVEL_KEY);

        // Uncomment below to restore Auto-Reopen feature back

        // if (
        //   currentLevel === ROOM_STATE.CLOSED ||
        //   currentLevel === ROOM_STATE.NOTIFIED
        // ) {
        //   const acquiredLock = await redisConnection.set(
        //     LOCK_KEY,
        //     "true",
        //     "EX",
        //     5,
        //     "NX",
        //   );

        //   if (!acquiredLock) {
        //     continue;
        //   }

        //   logSystemEvent(
        //     "human-detection",
        //     "info",
        //     "ATTEMPT_UNLOCK",
        //     `Unlocking room. State was ${currentLevel}.`,
        //     { roomId },
        //   );

        //   await handleHumanReentry(roomId);
        //   await redisConnection.del(LEVEL_KEY);
        // }

        if (currentLevel) {
          await redisConnection.del(LEVEL_KEY);
        }

        continue;
      }

      const startTime = await redisConnection.get(START_TIME_KEY);

      if (!startTime) {
        await redisConnection.set(START_TIME_KEY, now);
        continue;
      }

      if (isRoomBooked) {
        await redisConnection.set(START_TIME_KEY, now);
        await redisConnection.del(LEVEL_KEY);
        continue;
      }

      const idleMinutes = (now - parseInt(startTime)) / 60000;
      const currentLevel = await redisConnection.get(LEVEL_KEY);

      if (
        idleMinutes >= ROOM_SHUTDOWN_MINUTE_TRIGGER &&
        currentLevel !== ROOM_STATE.CLOSED
      ) {
        const acquiredLock = await redisConnection.set(
          LOCK_KEY,
          "true",
          "EX",
          5,
          "NX",
        );
        if (!acquiredLock) {
          continue;
        }

        // logSystemEvent(
        //   "human-detection",
        //   "info",
        //   "ROOM_SHUTDOWN",
        //   `Shutting down ${roomId}. No motion for: ${idleMinutes.toFixed(2)} mins.`,
        //   { roomId, sensorId, idleMinutes },
        // );
        await triggerShutdownAction(roomId, idleMinutes.toFixed(2));
        await redisConnection.set(LEVEL_KEY, ROOM_STATE.CLOSED);
      } else if (idleMinutes >= NOTI_MINUTE_TRIGGER && !currentLevel) {
        const currentTime = getFormattedDateTime();
        // logSystemEvent(
        //   "human-detection",
        //   "info",
        //   "ROOM_WARNING",
        //   `Warning sent. No motion for: ${idleMinutes.toFixed(2)} mins.`,
        //   { roomId, sensorId, idleMinutes },
        // );
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

const executeRoomAction = async (roomId, action, idleMinutes = null) => {
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
          acc[groupKey].ids.push({ id: deviceId, sub_id: deviceSubId });
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

        const successHardwareIds = [];
        let roomTitle = `Room ${roomId}`;
        let roomFloor = "Unknown";

        successes.forEach((res) => {
          try {
            const deviceMetaList = getDeviceByHardwareId(res.id);
            deviceMetaList.forEach((meta) => {
              if (meta.id && String(meta.room_id) === String(roomId)) {
                logIotAction(meta.id, action, null);
                successHardwareIds.push(res.id);
                if (meta.title) roomTitle = meta.title;
                if (meta.floor) roomFloor = meta.floor;
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

        if (successHardwareIds.length > 0) {
          logSystemEvent(
            "human-detection",
            "info",
            "EXECUTION_SUCCESS",
            `Auto-Turn ${action.toUpperCase()} ${successHardwareIds.join(", ")} in ${roomTitle} (Floor ${roomFloor}). ${idleMinutes ? `No motion for ${idleMinutes} mins` : ""}`,
            {
              roomId,
              action: action,
              device: successHardwareIds.join(", "),
              action_time: new Date().toISOString(),
              idle_minute: idleMinutes ? idleMinutes : null,
            },
          );
        }

        if (failures.length > 0) {
          const failKey = `partial-fail:${roomId}:${type}`;
          const now = Date.now();
          if (now - (errorThrottles.get(failKey) || 0) > ERROR_LOG_INTERVAL) {
            errorThrottles.set(failKey, now);

            const errorDetails = failures
              .map((f) => {
                const exactError =
                  f.data?.error ||
                  f.data?.detail ||
                  f.error ||
                  "Unknown Failure";
                return `${f.id} (${exactError})`;
              })
              .join(" | ");

            logSystemEvent(
              "human-detection",
              "warn",
              "PARTIAL_EXECUTION_FAIL",
              `Failed to Auto-Turn ${type} ${action.toUpperCase()}: ${errorDetails}`,
              { error: failures, action_time: new Date().toISOString() },
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
      title: "แจ้งเตือนการปิดห้องอัตโนมัติ",
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

const triggerShutdownAction = async (roomId, idleMinutes) => {
  await executeRoomAction(roomId, "off", idleMinutes);
};

const handleHumanReentry = async (roomId) => {
  await executeRoomAction(roomId, "on");
};

const syncHpsStatusLog = async (deviceDbId, currentStatus) => {
  const STATE_KEY = `devicestate:hps:${deviceDbId}`;
  const now = Date.now();

  try {
    const lastStatus = await redisConnection.hget(STATE_KEY, "status");
    await redisConnection.hset(STATE_KEY, "update_time", now);

    if (lastStatus !== currentStatus) {
      await redisConnection.hset(STATE_KEY, "status", currentStatus);
      logHpsStatus(deviceDbId, currentStatus);
    }
  } catch (error) {
    console.error(`[HPS_SYNC_ERROR] ID ${deviceDbId}: ${error.message}`);
  }
};

export const isRoomStillInactive = async (roomId, thresholdMinutes = 30) => {
  const BOOKING_KEY = `booking:active:room:${roomId}`;
  const START_TIME_KEY = `occupancy:start:room:${roomId}`;

  const isBooked = await redisConnection.get(BOOKING_KEY);

  if (isBooked) {
    return false;
  }

  const startTime = await redisConnection.get(START_TIME_KEY);
  if (!startTime) return true;

  const idleMinutes = (Date.now() - parseInt(startTime)) / 60000;

  return idleMinutes >= thresholdMinutes;
};
