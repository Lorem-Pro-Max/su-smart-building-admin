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

    const data = await executeAcTempAdjustment(device_id, temp);

    if (!data || data.status !== 200 || data.data?.success !== true) {
      throw {
        status: data?.status || 503,
        message:
          data?.data?.error ||
          data?.data?.result?.error ||
          "AC unit is not responding.",
      };
    }

    await syncIotDevice("ac");
    return res.status(200).json({ success: true });
  } catch (error) {
    return handleError(res, error, `acTempAdjust [${device_id}]`);
  }
};
