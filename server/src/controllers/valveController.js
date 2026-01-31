import * as IoTService from "../services/iotService.js";
import { emitDeviceUpdate } from "../utils/socketManager.js";
import { groupDevicesByFloor } from "../utils/responseFormatter.js";
import {
  valveDailyUsageData,
  valveHourlyUsageData,
} from "../data/valveMockData.js";
import { metaWithRoom } from "../data/mockMeta.js";

export const getValvesStatus = async (req, res) => {
  try {
    const data = await IoTService.fetchStatus("valves");
    const groupedData = groupDevicesByFloor(data);
    res.json({ data: groupedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const batchControl = async (req, res) => {
  const { deviceIds, action } = req.body;
  try {
    const results = await IoTService.executeBatch("valve", deviceIds, action);
    emitDeviceUpdate("valves", { type: "batch", results });
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const controlAll = async (req, res) => {
  const { action } = req.body;
  try {
    await IoTService.executeGlobal("valves", action);
    emitDeviceUpdate("valves", { type: "global", action });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMetadata = (req, res) => {
  const data = metaWithRoom;

  if (!data) return res.status(404).json({ error: "Valve metadata not found" });
  res.json({ data: data });
};

export const getDailyUsage = (req, res) => {
  const { floor, room } = req.query;

  if (!floor || !room)
    return res.status(400).json({ error: "Floor and Rooms are required" });
  const data = valveDailyUsageData[floor][room];

  if (!data)
    return res.status(404).json({ error: "Daily valve usage data not found" });

  if (room === "all") {
    res.json({ data: data });
  } else {
    res.json({ data: { [room]: data } });
  }
};

export const getHourlyUsage = (req, res) => {
  const { date, floor, room } = req.query;

  if (!floor || !room || !date)
    return res
      .status(400)
      .json({ error: "Floor, Rooms, and Date are required" });
  const data = valveHourlyUsageData[date][floor][room];

  if (!data)
    return res.status(404).json({ error: "Hourly valve usage data not found" });

  if (room === "all") {
    res.json({ data: data });
  } else {
    res.json({ data: { [room]: data } });
  }
};
