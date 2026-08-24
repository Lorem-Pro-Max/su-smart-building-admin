import { BOOKING_AUTO_OPEN_TYPES } from "../utils/controllerWrapper.js";
import { addIotJob, removeIotJob } from "./deviceQueueService.js";
import {
  cancelPendingBookingSchedules,
  completeExpiredBookings,
  fetchBookingById,
  fetchControllableRoomDevices,
  fetchPendingBookingSchedules,
  insertBookingSchedules,
  logSystemEvent,
} from "./dbService.js";

const OPEN_ACTION = "on";

const COMPLETION_SWEEP_INTERVAL = 60 * 1000;

export const createBookingOpenSchedules = async (bookingId, actionBy) => {
  const booking = await fetchBookingById(bookingId);

  if (!booking) {
    return { success: false, error: `Booking ${bookingId} not found` };
  }

  // อนุมัติซ้ำ / อนุมัติหลังเคยยกเลิก: ล้างของเดิมก่อนกันตั้งซ้อน
  await cancelBookingSchedules(bookingId);

  if (new Date(booking.end_dateTime) <= new Date()) {
    logSystemEvent(
      "schedule",
      "warn",
      "BOOKING_SCHEDULE_SKIPPED",
      `Booking ${bookingId} already ended. No open schedule created.`,
      { bookingId, roomId: booking.room_id },
    );
    return { success: true, skipped: true, reason: "BOOKING_ENDED" };
  }

  const deviceIds = await fetchControllableRoomDevices(
    booking.room_id,
    BOOKING_AUTO_OPEN_TYPES,
  );

  if (deviceIds.length === 0) {
    logSystemEvent(
      "schedule",
      "warn",
      "BOOKING_SCHEDULE_NO_DEVICE",
      `No controllable device found for room ${booking.room_id}`,
      { bookingId, roomId: booking.room_id },
    );
    return { success: false, error: "No controllable device in this room" };
  }

  const schedules = await insertBookingSchedules({
    bookingId,
    deviceIds,
    action: OPEN_ACTION,
    actionTime: booking.start_dateTime,
    actionBy,
  });

  const results = await Promise.all(
    schedules.map((item) =>
      addIotJob(
        item.device_id,
        item.action,
        item.action_time,
        bookingId,
        item.id,
        item.action_by,
      ),
    ),
  );

  const failed = results.filter((result) => !result.success);

  logSystemEvent(
    "schedule",
    failed.length > 0 ? "warn" : "info",
    "BOOKING_SCHEDULE_CREATED",
    `Booking ${bookingId}: queued ${results.length - failed.length}/${results.length} open jobs for ${booking.room_title || `room ${booking.room_id}`}`,
    {
      bookingId,
      roomId: booking.room_id,
      actionTime: booking.start_dateTime,
      failed: failed.map((item) => item.error),
    },
  );

  return { success: true, queued: results.length - failed.length };
};

export const cancelBookingSchedules = async (bookingId) => {
  const schedules = await fetchPendingBookingSchedules(bookingId);

  if (schedules.length === 0) {
    return { success: true, canceled: 0 };
  }

  await Promise.all(
    schedules.map((item) =>
      removeIotJob(item.device_id, item.action, bookingId, item.schedule_id),
    ),
  );

  // removeIotJob จะ mark ให้เฉพาะ job ที่ยังค้างอยู่ในคิว ที่เหลือปิดเองตรงนี้
  await cancelPendingBookingSchedules(bookingId);

  logSystemEvent(
    "schedule",
    "info",
    "BOOKING_SCHEDULE_CANCELED",
    `Booking ${bookingId}: canceled ${schedules.length} pending jobs`,
    { bookingId },
  );

  return { success: true, canceled: schedules.length };
};

/**
 * ไม่มี job ปิดห้องแล้ว จึงต้องมีตัวกวาดปิดสถานะ booking ที่หมดเวลาเป็น completed
 * ทำเป็น sweep แทน delayed job เพื่อให้กู้คืนเองได้หลัง server restart
 */
export const startBookingCompletionSweep = () => {
  const sweep = async () => {
    try {
      const completedIds = await completeExpiredBookings();

      if (completedIds.length > 0) {
        logSystemEvent(
          "schedule",
          "info",
          "BOOKING_COMPLETED",
          `Marked ${completedIds.length} booking(s) as completed`,
          { bookingIds: completedIds },
        );
      }
    } catch (error) {
      console.error(`[Booking Sweep] Failed: ${error.message}`);
    }
  };

  sweep();

  const timer = setInterval(sweep, COMPLETION_SWEEP_INTERVAL);
  timer.unref?.();

  return timer;
};
