import * as IoTService from "../services/iotService.js";
import { syncIotDevice } from "../services/socketService.js";
import { formatDeviceUpdate } from "../utils/responseFormatter.js";

export const getStatusHandler = (deviceType) => async (req, res) => {
  try {
    const data = await IoTService.fetchStatusByType(deviceType);
    const groupedData = formatDeviceUpdate(data, deviceType);
    return res.json({ data: groupedData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const handleBatchCommand =
  (deviceType, executeFn = IoTService.executeBatch) =>
  async (req, res) => {
    const { deviceIds, action } = req.body;

    try {
      const result = await executeFn(deviceType, deviceIds, action);
      const failedItems = result.filter(
        (r) => r.status !== 200 || r.data?.success !== true,
      );

      if (failedItems.length > 0) {
        const firstError = failedItems[0];

        return res.json({
          success: false,
          error:
            firstError?.data?.error ||
            firstError?.data?.result?.error ||
            `Failed to execute action on ${failedItems.length} device(s).`,
        });
      }

      await syncIotDevice(deviceType);
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };
