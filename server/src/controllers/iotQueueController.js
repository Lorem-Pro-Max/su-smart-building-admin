import { addIotJob } from "../services/deviceQueueService.js";
import { handleError } from "../utils/errorFormatter.js";

export const AddIotQueue = async (req, res) => {
  try {
    const { deviceId, action, actionTime, bookingId, scheduleId, actionBy } = req.body;

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
      actionBy
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
