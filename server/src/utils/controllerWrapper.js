import * as IoTService from "../services/iotService.js";
import { syncIotDevice } from "../services/socketService.js";
import { formatDeviceUpdate } from "../utils/responseFormatter.js";
import { handleError } from "../utils/errorFormatter.js";

export const EXECUTION_REGISTRY = {
  valves: IoTService.executeValveAction,
  doors: IoTService.executeDoorAction,
  default: IoTService.executeBatch,
};

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

export const handleBatchCommand = (deviceType) => async (req, res) => {
  const { deviceIds, action, value = null } = req.body;

  try {
    if (!deviceIds || !Array.isArray(deviceIds) || !action) {
      throw {
        status: 400,
        message: "deviceIds (array) and action are required!",
      };
    }

    const execute =
      EXECUTION_REGISTRY[deviceType] || EXECUTION_REGISTRY.default;

    const normalizedDeviceIds = deviceIds.map((item) => {
      if (typeof item === "object" && item !== null) {
        return { id: item.id, sub_id: item.sub_id || null };
      }
      return { id: String(item), sub_id: null };
    });

    const result = await execute(
      deviceType,
      normalizedDeviceIds,
      action,
      value,
    );

    const failedItems = result.filter(
      (r) => !r || r.status !== 200 || r.data?.success !== true,
    );

    await syncIotDevice(deviceType);

    if (failedItems.length > 0) {
      const first = failedItems[0];

      const errorMessage =
        first.data?.detail ||
        first.data?.error ||
        first.error ||
        first.data?.message ||
        `Hardware error (Status ${first.status || "???"})`;

      throw {
        status: 502,
        message: errorMessage,
        failedCount: failedItems.length,
      };
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return handleError(res, error, `handleBatchCommand [${deviceType}]`);
  }
};
