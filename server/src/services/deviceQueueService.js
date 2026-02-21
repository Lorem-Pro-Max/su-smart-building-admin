import { Queue, Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import { getDeviceByTableId } from "../utils/deviceMap.js";
import { EXECUTION_REGISTRY } from "../utils/controllerWrapper.js";
import { isRoomStillInactive } from "./humanDetectionService.js";
import {
  fetchIotSchedule,
  logSystemEvent,
  updateIotScheduleStatus,
  logIotAction,
} from "./dbService.js";

export const iotQueue = new Queue("iot-scheduling", {
  connection: redisConnection,
});

const ON_GRACE_PERIOD = 30 * 60 * 1000;

const ACTION_MAP = {
  open: "on",
  on: "on",
  close: "off",
  off: "off",
};

const iotWorker = new Worker(
  "iot-scheduling",
  async (job) => {
    const {
      scheduleId,
      deviceId,
      deviceSubId,
      action,
      deviceType,
      roomTitle,
      scheduledTime,
      deviceTableId,
      roomTableId,
    } = job.data;

    try {
      const now = Date.now();
      const delayAmount = now - scheduledTime;

      if (action === "on" && delayAmount > ON_GRACE_PERIOD) {
        logSystemEvent(
          "schedule",
          "warn",
          "ON_EXPIRED",
          `Skipped: late by ${Math.round(delayAmount / 60000)}m`,
          { scheduleId, roomTitle, delayAmount },
        );
        await updateIotScheduleStatus(scheduleId, "canceled");
        return { skipped: true, reason: "EXPIRED_ON" };
      }

      if (action === "off") {
        const isInactive = await isRoomStillInactive(roomTableId);
        if (!isInactive) {
          logSystemEvent(
            "schedule",
            "info",
            "OFF_ABORTED",
            `Occupancy detected in ${roomTitle}. Skipping shutdown.`,
            { scheduleId, roomId: roomTableId },
          );
          await updateIotScheduleStatus(scheduleId, "canceled");
          return { skipped: true, reason: "OCCUPIED" };
        }
      }

      const execute =
        EXECUTION_REGISTRY[deviceType] || EXECUTION_REGISTRY.default;
      const results = await execute(
        deviceType,
        [deviceId],
        action,
        deviceSubId,
      );

      const isSuccess = results.every(
        (res) => res.status === 200 && res.data?.success !== false,
      );

      if (!isSuccess) {
        const firstErr = results.find(
          (r) => r.status !== 200 || r.data?.success === false,
        );

        const errMsg =
          firstErr?.data?.detail ||
          firstErr?.data?.error ||
          firstErr?.error ||
          "Unknown Failure";
        throw new Error(`EXECUTION_FAILED: ${errMsg}`);
      }

      await updateIotScheduleStatus(scheduleId, "done");
      logIotAction(deviceTableId, action, 1);

      logSystemEvent(
        "schedule",
        "info",
        "EXECUTION_SUCCESS",
        `${action.toUpperCase()} command verified for ${roomTitle}`,
        { scheduleId },
      );
    } catch (err) {
      if (job.attemptsMade + 1 >= job.opts.attempts) {
        await updateIotScheduleStatus(scheduleId, "failed");
        logSystemEvent("schedule", "error", "EXECUTION_FAILED", err.message, {
          scheduleId,
          attempts: job.attemptsMade + 1,
        });
      }

      console.error(`[IoT Worker] FATAL: ID ${scheduleId} | ${err.message}`);
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
      throw {
        status: 400,
        message: "REQUIRED_KEYS: deviceId, action, actionTime, scheduleId",
      };
    }

    const normalizedAction = ACTION_MAP[action] || action;
    const meta = getDeviceByTableId(String(deviceId));

    if (!meta) {
      throw {
        status: 404,
        message: `Device Table ID ${deviceId} not found in cache.`,
      };
    }

    const scheduledTime = new Date(actionTime).getTime();
    if (isNaN(scheduledTime)) {
      throw { status: 400, message: `INVALID_TIME: ${actionTime}` };
    }

    const now = Date.now();
    const delay = Math.max(0, scheduledTime - now);

    const jobId = `${scheduleId}-${bookingId}-${normalizedAction}-${meta.device_id}-${meta.device_sub_id || "null"}`;

    const job = await iotQueue.add(
      "toggle-device",
      {
        scheduleId,
        deviceId: meta.device_id,
        deviceSubId: meta.device_sub_id || null,
        action: normalizedAction,
        deviceType: meta.key,
        roomTitle: meta.title,
        scheduledTime,
        deviceTableId: meta.id,
        roomTableId: meta.room_id,
      },
      {
        delay,
        jobId,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: { age: 72 * 3600 },
      },
    );

    return { success: true, jobId: job?.id };
  } catch (error) {
    if (!error.status || error.status === 500) {
      logSystemEvent("schedule", "error", "QUEUE_ADD_FAIL", error.message, {
        scheduleId,
        deviceId,
      });
    }
    return {
      success: false,
      error: error.message || "Internal Queue Error",
      status: error.status || 500,
    };
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
      throw {
        status: 400,
        message: "REQUIRED_KEYS: deviceId, action, scheduleId",
      };
    }

    const normalizedAction = ACTION_MAP[action] || action;
    const meta = getDeviceByTableId(String(deviceId));

    if (!meta) {
      throw {
        status: 404,
        message: `Device Table ID ${deviceId} not found in cache.`,
      };
    }

    const jobId = `${scheduleId}-${bookingId}-${normalizedAction}-${meta.device_id}-${meta.device_sub_id || "null"}`;

    const job = await iotQueue.getJob(jobId);

    if (job) {
      await job.remove();
      await updateIotScheduleStatus(scheduleId, "canceled");
      return { success: true };
    }

    return { success: false, error: "Job not found" };
  } catch (error) {
    logSystemEvent("schedule", "warn", "QUEUE_REMOVE_FAIL", error.message, {
      scheduleId,
    });

    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
};

export const initColdStartSync = async () => {
  try {
    const pendingTasks = await fetchIotSchedule();
    if (!pendingTasks || pendingTasks.length === 0) {
      console.log("[IoT Queue] Cold Start: No pending tasks to recover.");
      return;
    }

    console.log(
      `[IoT Queue] Cold Start: Recovering ${pendingTasks.length} pending tasks from DB...`,
    );

    logSystemEvent(
      "schedule",
      "info",
      "COLD_START_SYNC",
      `Re-syncing ${pendingTasks.length} tasks`,
    );

    let successCount = 0;

    for (const task of pendingTasks) {
      const result = await addIotJob(
        task.device_id,
        task.action,
        task.action_time,
        task.booking_id ?? "manual",
        task.schedule_id,
      );

      if (result.success) {
        successCount++;
      } else {
        logSystemEvent(
          "schedule",
          "error",
          "SYNC_TASK_FAIL",
          `Task ${task.schedule_id} failed to re-queue`,
          { error: result.error },
        );
      }
    }

    console.log(
      `[IoT Queue] Cold Start: Recovery complete (${successCount}/${pendingTasks.length} jobs queued).`,
    );
  } catch (error) {
    console.error(`[IoT Queue] Cold Start FATAL ERROR: ${error.message}`);
    logSystemEvent("schedule", "fatal", "COLD_START_FATAL", error.message);
  }
};
