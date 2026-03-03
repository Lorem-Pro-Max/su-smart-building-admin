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
  fetchActiveBookings,
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
      actionBy,
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
            `Occupancy detected or Room is Booked (${roomTitle}). Skipping shutdown.`,
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
        [
          {
            id: deviceId,
            sub_id: deviceSubId || null,
          },
        ],
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
        throw new Error(
          `Failed to process: ${action} | ${roomTitle} | ${deviceId} | ${errMsg}`,
        );
      }

      await updateIotScheduleStatus(scheduleId, "done");
      logIotAction(deviceTableId, action, actionBy ? String(actionBy) : null);

      logSystemEvent(
        "schedule",
        "info",
        "EXECUTION_SUCCESS",
        `Scheduled ${action.toUpperCase()} for ${roomTitle} (${deviceType} | ${deviceId})`,
        {
          scheduleId,
          deviceId,
          deviceType,
          action,
          roomTableId,
          actionBy: actionBy || "SYSTEM",
        },
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
  {
    connection: redisConnection,
    concurrency: 20,
    lockDuration: 30000,
  },
);

export const addIotJob = async (
  deviceId,
  action,
  actionTime,
  bookingId = "manual",
  scheduleId,
  actionBy = null,
) => {
  try {
    if (!deviceId || !action || !actionTime || !scheduleId) {
      return {
        success: false,
        status: 400,
        error:
          "REQUIRED_KEYS: deviceId, action, actionTime, scheduleId, actionBy (actionBy is nullable)",
      };
    }

    const normalizedAction = ACTION_MAP[action] || action;
    const meta = getDeviceByTableId(String(deviceId));

    if (!meta) {
      return {
        success: false,
        status: 404,
        error: `Device Table ID ${deviceId} not found in cache.`,
      };
    }

    const scheduledTime = new Date(actionTime).getTime();
    if (isNaN(scheduledTime)) {
      return {
        success: false,
        status: 400,
        error: `Invalid time format (require timestampz): ${actionTime}`,
      };
    }

    const now = Date.now();
    let delay = Math.max(0, scheduledTime - now);

    if (normalizedAction == "on") {
      delay += 10000;
    }

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
        actionBy,
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
    if (error.status && error.status !== 404 && error.status !== 400) {
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
      return {
        success: false,
        status: 400,
        error: "REQUIRED_KEYS: deviceId, action, scheduleId",
      };
    }

    const normalizedAction = ACTION_MAP[action] || action;
    const meta = getDeviceByTableId(String(deviceId));

    if (!meta) {
      return {
        success: false,
        status: 404,
        error: `Device Table ID ${deviceId} not found in cache.`,
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
    console.warn(`[IoT Queue] Job removal failed: ${error.message}`);

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
        task.action_by ?? null,
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
      `[IoT Queue] Recovery complete (${successCount}/${pendingTasks.length} jobs queued).`,
    );
  } catch (error) {
    console.error(`[IoT Queue] Cold Start FATAL ERROR: ${error.message}`);
    logSystemEvent("schedule", "fatal", "COLD_START_FATAL", error.message);
  }
};

export const setActiveRoom = async (roomId, endDateTime) => {
  try {
    if (!roomId || !endDateTime) {
      return {
        success: false,
        status: 400,
        error: "REQUIRED_KEYS: roomId and endDateTime",
      };
    }

    const endTime = new Date(endDateTime).getTime();
    if (isNaN(endTime)) {
      return {
        success: false,
        status: 400,
        error: `Invalid time format (require timestampz): ${endDateTime}`,
      };
    }

    const now = Date.now();
    const secondsUntilEnd = Math.floor((endTime - now) / 1000);

    if (secondsUntilEnd > 0) {
      await redisConnection.set(
        `booking:active:room:${roomId}`,
        "true",
        "EX",
        secondsUntilEnd,
      );
      return {
        success: true,
        message: `Set Active room ${roomId} for ${secondsUntilEnd}s`,
      };
    }

    return { success: false, error: "Booking has already expired" };
  } catch (error) {
    logSystemEvent("schedule", "error", "ACTIVE_ROOM_SET_FAIL", error.message, {
      roomId,
      endDateTime,
    });
    console.error(`[Active Room] Failed to set active room: ${error.message}`);
    return {
      success: false,
      error: error.message || "Internal Redis Error",
      status: error.status || 500,
    };
  }
};

export const initActiveRoomSync = async () => {
  try {
    const activeBookings = await fetchActiveBookings();

    if (!activeBookings || activeBookings.length === 0) {
      console.log("[Active Room] No active bookings to restore.");
      return;
    }

    console.log(
      `[Active Room] Restoring ${activeBookings.length} active room locks...`,
    );

    let successCount = 0;

    for (const booking of activeBookings) {
      const result = await setActiveRoom(booking.room_id, booking.end_dateTime);
      if (result.success) successCount++;
    }

    logSystemEvent(
      "schedule",
      "info",
      "COLD_START_ROOM_SYNC",
      `Restored ${successCount}/${activeBookings.length} active room locks`,
    );

    console.log(`[Active Room] Successfully restored ${successCount} locks.`);
  } catch (error) {
    console.error(`[Active Room] Cold Start FATAL: ${error.message}`);
    logSystemEvent("schedule", "fatal", "COLD_START_ROOM_FATAL", error.message);
  }
};
