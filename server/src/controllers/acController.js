import * as IoTService from "../services/iotService.js";
import { emitDeviceUpdate } from "../utils/socketManager.js";
import { groupDevicesByFloor } from "../utils/responseFormatter.js";

export const getAcStatus = async (req, res) => {
  try {
    const data = await IoTService.fetchStatus("ac");
    const groupedData = groupDevicesByFloor(data);

    res.json({ data: groupedData });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const setTemperature = async (req, res) => {
  const { deviceIds, temp } = req.body;
  try {
    const results = await IoTService.executeBatch(
      "ac",
      deviceIds,
      "set_temp",
      temp,
    );
    emitDeviceUpdate("ac", { type: "temp_change", results, temp });
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const batchControl = async (req, res) => {
  const { deviceIds, action } = req.body;
  try {
    const results = await IoTService.executeBatch("ac", deviceIds, action);
    emitDeviceUpdate("ac", { type: "batch", results });
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const controlAll = async (req, res) => {
  const { action } = req.body;
  try {
    await IoTService.executeGlobal("ac", action);
    emitDeviceUpdate("ac", { type: "global", action });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
