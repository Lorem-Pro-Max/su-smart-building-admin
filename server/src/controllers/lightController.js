import * as IoTService from "../services/iotService.js";
import { emitDeviceUpdate } from "../services/socketService.js";
import { formatProductionUpdate } from "../utils/responseFormatter.js";

export const getLightsStatus = async (req, res) => {
  try {
    const data = await IoTService.fetchStatusByType("lights");
    const groupedData = formatProductionUpdate(data);
    res.json({ data: groupedData });
  } catch (error) {
    res.status(500).json({ error: error.message + "yeet" });
  }
};

export const batchControl = async (req, res) => {
  const { deviceIds, action } = req.body;
  try {
    const result = await IoTService.executeBatch("lights", deviceIds, action);
    const returnedData = result[0];

    if (returnedData.status != 200 || returnedData.data.success !== true) {
      res.json({
        success: false,
        error:
          returnedData.data.error ||
          returnedData.data.result.error ||
          "Internal Error: Please try again later",
      });
      return;
    }

    const data = await IoTService.fetchStatusByType("lights");
    const groupedData = formatProductionUpdate(data);
    emitDeviceUpdate("lights", groupedData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const controlAll = async (req, res) => {
  const { action } = req.body;
  try {
    await IoTService.executeGlobal("lights", action);
    emitDeviceUpdate("lights", { type: "global", action });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
