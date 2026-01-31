import * as IoTService from "../services/iotService.js";
import { emitDeviceUpdate } from "../utils/socketManager.js";
import { groupDevicesByFloor } from "../utils/responseFormatter.js";

export const getExhaustFansStatus = async (req, res) => {
  try {
    const data = await IoTService.fetchStatus("exhaustFans");
    const groupedData = groupDevicesByFloor(data);
    res.json({ data: groupedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const batchControl = async (req, res) => {
  const { deviceIds, action } = req.body;
  try {
    const results = await IoTService.executeBatch(
      "exhaustFan",
      deviceIds,
      action,
    );
    emitDeviceUpdate("exhaustfans", { type: "batch", results });
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const controlAll = async (req, res) => {
  const { action } = req.body;
  try {
    await IoTService.executeGlobal("exhaustFans", action);
    emitDeviceUpdate("exhaustfans", { type: "global", action });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
