import * as IoTService from "../services/iotService.js";
import { emitDeviceUpdate } from "../services/socketService.js";
import {
  formatDeviceUpdate,
} from "../utils/responseFormatter.js";

export const getStatusHandler =
  (deviceType, formatFn = formatDeviceUpdate) =>
  async (req, res) => {
    try {
      const data = await IoTService.fetchStatusByType(deviceType);
      const groupedData = formatFn(data);
      res.json({ data: groupedData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export const handleBatchCommand =
  (deviceType, executeFnName = "executeBatch") =>
  async (req, res) => {
    const { deviceIds, action } = req.body;

    try {
      const execute = IoTService[executeFnName];
      const result = await execute(deviceType, deviceIds, action);

      const returnedData = result[0];
      if (
        !returnedData ||
        returnedData.status !== 200 ||
        returnedData.data?.success !== true
      ) {
        return res.json({
          success: false,
          error:
            returnedData?.data?.error ||
            returnedData?.data?.result?.error ||
            "Internal Error: Please try again later",
        });
      }

      const data = await IoTService.fetchStatusByType(deviceType);
      const groupedData = formatDeviceUpdate(data);
      emitDeviceUpdate(deviceType, groupedData);

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };
