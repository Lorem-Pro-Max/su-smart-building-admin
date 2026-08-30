/**
 * [LEGACY - ไม่มีผู้เรียกแล้ว]
 * ใช้ตอนที่ระบบจองฝั่ง user เป็นคนสั่งเปิดห้องเอง (กดเช็คอิน -> ยิง /add-queue + /set-active-room)
 * ตอนนี้ห้องเปิดอัตโนมัติตามเวลาจอง คิวถูกตั้งจากฝั่ง admin เองใน bookingScheduleService.js
 * เก็บไฟล์ไว้เผื่อมี service ภายนอกต้องสั่งคิวโดยตรง ถ้าแน่ใจว่าไม่ใช้แล้วค่อยลบทั้งไฟล์
 */
import { addIotJob, setActiveRoom } from "../services/deviceQueueService.js";
import { handleError } from "../utils/errorFormatter.js";

export const AddIotQueue = async (req, res) => {
  try {
    const { deviceId, action, actionTime, bookingId, scheduleId, actionBy } =
      req.body;

    if (!deviceId || !action || !actionTime || !scheduleId) {
      return res.status(400).json({
        status: 400,
        message:
          "deviceId(table ID), action, actionTime, scheduleId are required, actionBy(nullable). (bookingId is optional)",
      });
    }
    const safeBookingId = bookingId ?? "manual";

    const result = await addIotJob(
      deviceId,
      action,
      actionTime,
      safeBookingId,
      scheduleId,
      actionBy,
    );

    if (!result.success) {
      throw {
        status: result.status || 500,
        message: result.error,
      };
    }

    return res.status(200).json({
      success: true,
      message: "Job successfully added to queue",
      jobId: result.jobId,
    });
  } catch (error) {
    return handleError(res, error, "POST /iot/add-queue");
  }
};

export const SetActiveRoom = async (req, res) => {
  try {
    const { room_id, end_dateTime } = req.body;

    if (!room_id || !end_dateTime) {
      return res.status(400).json({
        status: 400,
        message: "roomId and endDateTime (ISO/Timestamp) are required.",
      });
    }

    const result = await setActiveRoom(room_id, end_dateTime);

    if (!result.success) {
      throw { status: result.status || 500, message: result.error };
    }

    return res.status(200).json({ result });
  } catch (error) {
    return handleError(res, error, "POST /iot/set-active-room");
  }
};
