import {
  valveDailyUsageData,
  valveHourlyUsageData,
} from "../data/valveMockData.js";
import { metaWithRoom } from "../data/mockMeta.js";
import {
  getStatusHandler,
  handleBatchCommand,
} from "../utils/controllerWrapper.js";

const device_type = "valves";

export const getValvesStatus = getStatusHandler(device_type);
export const ValvesBatchControl = handleBatchCommand(device_type);

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
