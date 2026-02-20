import { Queue, Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import { deviceCache } from "./socketService.js";
import * as IoTService from "./iotService.js";

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

const EXECUTION_MAP = {
  valves: (d) =>
    IoTService.executeValveAction(
      d.deviceType,
      [d.deviceId],
      d.action,
      d.deviceSubId,
    ),
  doors: (d) =>
    IoTService.executeDoorAction(d.deviceType, [d.deviceId], d.action),
  default: (d) => IoTService.executeBatch(d.deviceType, [d.deviceId], d.action),
};
const iotWorker = new Worker(
  "iot-scheduling",
  async (job) => {
    const { scheduleId, deviceId, deviceSubId, action, deviceType, roomTitle } =
      job.data;

    try {
      const execute = EXECUTION_MAP[deviceType] || EXECUTION_MAP.default;
      const results = await execute(job.data);
      const isSuccess = results.every((res) => res.status === 200);

      if (!isSuccess) {
        throw new Error(`EXECUTION_FAILED: ${JSON.stringify(results)}`);
      }

      console.log(
        `[IoT Queue] SUCCESS: ${scheduleId} | ${roomTitle} | ${action}`,
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

    const delay = Math.max(0, scheduledTime - Date.now());
    const hardwareId = meta.device_id;
    const deviceType = meta.key;
    const hardwareSubId = meta.device_sub_id || null;
    const roomTitle = meta.title;

    const jobId = `${scheduleId}-${bookingId}-${action}-${normalizedAction}-${hardwareSubId}`;

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
        removeOnFail: true,
      },
    );

    if (!job?.id) throw new Error("REDIS_FAILED: No job ID returned");

    console.log(`[IoT Queue] QUEUE ADDED: ${jobId}`);
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
      const err = new Error(
        `NOT_FOUND: Device ${deviceId} missing from device map`,
      );
      err.status = 404;
      throw err;
    }

    const hardwareId = meta.device_id;
    const hardwareSubId = meta.device_sub_id || null;
    const jobId = `${scheduleId}-${bookingId}-${normalizedAction}-${hardwareId}-${hardwareSubId}`;

    const job = await iotQueue.getJob(jobId);

    if (job) {
      await job.remove();
      console.log(`[IoT Queue] REVOKED: ${jobId}`);
      return { success: true, message: "Job removed" };
    } else {
      console.log(`[IoT Queue] REMOVE_NOT_FOUND: ${jobId}`);
      return { success: false, error: "Job not found" };
    }
  } catch (error) {
    console.error(`[IoT Queue] REMOVE_FATAL: ${error.message}`);
    return { success: false, error: error.message };
  }
};
