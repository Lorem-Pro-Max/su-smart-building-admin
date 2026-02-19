import * as IoTService from "../services/iotService.js";
import { syncIotDevice } from "../services/socketService.js";
import { formatDeviceUpdate } from "../utils/responseFormatter.js";
import { handleError } from "../utils/errorFormatter.js";

export const getStatusHandler = (deviceType) => async (req, res) => {
  try {
    const data = await IoTService.fetchStatusByType(deviceType);

    if (!data) {
      throw {
        status: 503,
        message: `${deviceType} status is currently unavailable.`,
      };
    }

    const groupedData = formatDeviceUpdate(data, deviceType);
    return res.status(200).json({ success: true, data: groupedData });
  } catch (error) {
    return handleError(res, error, `getStatusHandler [${deviceType}]`);
  }
};

export const handleBatchCommand =
  (deviceType, executeFn = IoTService.executeBatch) =>
  async (req, res) => {
    const { deviceIds, action } = req.body;

    try {
      if (!deviceIds || !Array.isArray(deviceIds) || !action) {
        throw {
          status: 400,
          message: "deviceIds (array) and action are required!",
        };
      }

      const result = await executeFn(deviceType, deviceIds, action);
      const failedItems = result.filter(
        (r) => !r || r.status !== 200 || r.data?.success !== true,
      );

      if (failedItems.length > 0) {
        const firstError = failedItems[0];
        const failedCount = failedItems.length;

        const errorMessage =
          firstError?.data?.error ||
          firstError?.data?.result?.error ||
          `No response from the device`;

        throw { status: 502, message: errorMessage, failedCount: failedCount };
      }

      await syncIotDevice(deviceType);
      return res.status(200).json({ success: true });
    } catch (error) {
      return handleError(res, error, `handleBatchCommand [${deviceType}]`);
    }
  };
