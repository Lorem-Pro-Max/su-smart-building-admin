import {
  getStatusHandler,
  handleBatchCommand,
} from "../utils/controllerWrapper.js";
import { executeAcTempAdjustment } from "../services/iotService.js";
import { syncIotDevice } from "../services/socketService.js";

const deviceType = "ac";

export const getAcStatus = getStatusHandler(deviceType);
export const acBatchControl = handleBatchCommand(deviceType);

export const acTempAdjust = async (req, res) => {
  const { device_id, temp } = req.body;

  if (!device_id || !temp) {
    return res.json({
      success: false,
      error: "device_id and temp are required!",
    });
  }

  try {
    const data = await executeAcTempAdjustment(device_id, temp);

    if (!data || data.status !== 200 || data?.success !== true) {
      return res.json({
        success: false,
        error:
          data?.error ||
          data?.result?.error ||
          `Failed to adjust air conditioner temperature due to unexpected internal error.`,
      });
    }

    await syncIotDevice(deviceType);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
