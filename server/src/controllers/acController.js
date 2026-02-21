import {
  getStatusHandler,
  handleBatchCommand,
} from "../utils/controllerWrapper.js";
import { executeAcTempAdjustment } from "../services/iotService.js";
import { syncIotDevice } from "../services/socketService.js";
import { handleError } from "../utils/errorFormatter.js";

const deviceType = "ac";

export const getAcStatus = getStatusHandler(deviceType);
export const acBatchControl = handleBatchCommand(deviceType);

export const acTempAdjust = async (req, res) => {
  const { device_id, temp } = req.body;

  try {
    if (!device_id || !temp) {
      throw { status: 400, message: "device_id and temp are required!" };
    }

    const result = await executeAcTempAdjustment(device_id, temp);
    await syncIotDevice(deviceType);

    const isFailure =
      !result || result.status !== 200 || result.data?.success !== true;

    if (isFailure) {
      const errorMessage =
        result?.data?.detail ||
        result?.data?.error ||
        result?.error ||
        result?.data?.message ||
        "AC unit is not responding.";

      throw {
        status: 502,
        message: errorMessage,
        failedCount: 1,
      };
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return handleError(res, error, `acTempAdjust [${device_id}]`);
  }
};
