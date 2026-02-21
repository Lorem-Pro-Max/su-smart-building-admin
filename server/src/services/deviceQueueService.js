import { Queue, Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import { deviceCache } from "./socketService.js";
import { EXECUTION_REGISTRY } from "../utils/controllerWrapper.js";
import { isRoomStillInactive } from "./humanDetectionService.js";

export const iotQueue = new Queue("iot-scheduling", {
  connection: redisConnection,
});

const ACTION_MAP = {
  open: "on",
  on: "on",
  close: "off",
  off: "off",
};

const getCache = () => {
  const cache = deviceCache.byId;
  if (!cache || Object.keys(cache).length === 0) {
    const err = new Error("[CACHE] Failed to cache device mapping data");
    err.status = 503;
    throw err;
  }
  return cache;
};

const iotWorker = new Worker(
  "iot-scheduling",
  async (job) => {
    const { scheduleId, deviceId, deviceSubId, action, deviceType, roomTitle } =
      job.data;

    try {
      const execute =
        EXECUTION_REGISTRY[deviceType] || EXECUTION_REGISTRY.default;
      const results = await execute(
        deviceType,
        [deviceId],
        action,
        deviceSubId,
      );
      const isSuccess = results.every((res) => res.status === 200);

      if (!isSuccess) {
        throw new Error(`EXECUTION_FAILED: ${JSON.stringify(results)}`);
      }

      console.log(
        `[IoT Queue] SUCCESS: ${scheduleId} | ${roomTitle} | ${deviceType} |${action}`,
      );
    } catch (err) {
      console.error(`[Queue] FAIL: ID ${scheduleId} | ${err.message}`);
      throw err;
    }
  },
  { connection: redisConnection },
);

export const addIotJob = async (
  deviceId,
  action,
  actionTime,
  bookingId = "manual",
  scheduleId,
) => {
  try {
    if (!deviceId || !action || !actionTime || !scheduleId) {
      const err = new Error(
        "REQUIRED_KEYS: deviceId, action, actionTime, scheduleId",
      );
      err.status = 400;
      throw err;
    }

    const normalizedAction = ACTION_MAP[action] || action;
    const cache = getCache();
    const meta = cache[String(deviceId)];

    if (!meta) {
      const err = new Error(`NOT_FOUND: Device ${deviceId} not found`);
      err.status = 404;
      throw err;
    }

    const scheduledTime = new Date(actionTime).getTime();

    if (isNaN(scheduledTime)) {
      const err = new Error(`INVALID_TIME: ${actionTime}`);
      err.status = 400;
      throw err;
    }

    const isPowerOn = true ? normalizedAction === "on" : false;

    const now = Date.now();
    const POWER_ON_GRACE_PERIOD = 60 * 1000;
    const POWER_OFF_GRACE_PERIOD = 4 * 60 * 60 * 1000;

    if (isPowerOn && scheduledTime < now - POWER_ON_GRACE_PERIOD) {
      return { success: false, error: "SCHEDULE_TIME_PASSED" };
    }

    if (!isPowerOn && scheduledTime < now - POWER_OFF_GRACE_PERIOD) {
      return { success: false, error: "SCHEDULE_TIME_PASSED" };
    }

    const delay = Math.max(0, scheduledTime - now);

    const hardwareId = meta.device_id;
    const deviceType = meta.key;
    const hardwareSubId = meta.device_sub_id || null;
    const roomTitle = meta.title;

    const jobId = `${scheduleId}-${bookingId}-${normalizedAction}-${hardwareId}-${hardwareSubId}`;

    const job = await iotQueue.add(
      "toggle-device",
      {
        scheduleId: scheduleId,
        deviceId: hardwareId,
        deviceSubId: hardwareSubId,
        action: normalizedAction,
        deviceType: deviceType,
        roomTitle: roomTitle,
      },
      {
        delay,
        jobId,
        removeOnComplete: true,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: { age: 72 * 3600 },
      },
    );

    if (!job?.id) {
      throw new Error("REDIS_FAILED: No job ID returned");
    }

    return { success: true, jobId: job.id };
  } catch (error) {
    console.error(`[IoT Queue] FATAL_ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const removeIotJob = async (
  deviceId,
  action,
  bookingId = "manual",
  scheduleId,
) => {
  try {
    if (!deviceId || !action || !scheduleId) {
      const err = new Error("REQUIRED_KEYS: deviceId, action, scheduleId");
      err.status = 400;
      throw err;
    }

    const normalizedAction = ACTION_MAP[action] || action;
    const cache = getCache();
    const meta = cache[String(deviceId)];

    if (!meta) {
      const err = new Error(`NOT_FOUND: Device ID: ${deviceId} not found`);
      err.status = 404;
      throw err;
    }

    const hardwareId = meta.device_id;
    const hardwareSubId = meta.device_sub_id || null;
    const jobId = `${scheduleId}-${bookingId}-${normalizedAction}-${hardwareId}-${hardwareSubId}`;

    const job = await iotQueue.getJob(jobId);

    if (job) {
      await job.remove();
      return { success: true };
    } else {
      return { success: false, error: "Job not found" };
    }
  } catch (error) {
    console.error(`[IoT Queue] REMOVE_FATAL: ${error.message}`);
    return { success: false, error: error.message };
  }
};
