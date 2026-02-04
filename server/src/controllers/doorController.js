import * as IoTService from "../services/iotService.js";
import { emitDeviceUpdate } from "../utils/socketManager.js";
import { groupDevicesByFloor } from "../utils/responseFormatter.js";

export const getDoorsStatus = async (req, res) => {
  try {
    const data = await IoTService.fetchStatus("doors");
    const groupedData = groupDevicesByFloor(data);

    res.json({ data: groupedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const batchControl = async (req, res) => {
  const { deviceIds, action } = req.body;
  try {
    await IoTService.executeBatch("door", deviceIds, action);
    const rawData = await IoTService.fetchStatus("doors");
    const groupedData = groupDevicesByFloor(rawData);
    emitDeviceUpdate("doors", groupedData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const controlAll = async (req, res) => {
  const { action } = req.body;
  try {
    await IoTService.executeGlobal("doors", action);
    const rawData = await IoTService.fetchStatus("doors");
    const groupedData = groupDevicesByFloor(rawData);
    emitDeviceUpdate("doors", groupedData);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
