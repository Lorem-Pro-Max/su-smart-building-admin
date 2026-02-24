import {
  valveDailyUsageData,
  valveHourlyUsageData,
} from "../data/valveMockData.js";
import { metaWithRoom } from "../data/mockMeta.js";
import {
  getStatusHandler,
  handleBatchCommand,
} from "../utils/controllerWrapper.js";
import * as waterUseageService from "../services/waterUseageService.js";

const device_type = "valves";

export const getValvesStatus = getStatusHandler(device_type);
export const ValvesBatchControl = handleBatchCommand(device_type);

export const getMetadata = async (req, res) => {
  try {
    const data = await waterUseageService.getMetadata();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDailyUsage = async (req, res) => {
  const { floor, room } = req.query;

  if (!floor || !room) {
    return res.status(400).json({ error: "Floor and Rooms are required" });
  }

  if (room === "all") {
    const data = await waterUseageService.fetchDailyByFloor(floor);
    return res.json({ data: data });
  } else {
    const data = await waterUseageService.fetchDailyByRoom(floor, room);
    return res.json({ data: data });
  }
};

export const getHourlyUsage = async (req, res) => {
  const { date, floor, room } = req.query;
  try {
    console.log(date, floor, room);

    if (!floor || !room || !date) {
      return res
        .status(400)
        .json({ error: "Floor, Rooms, and Date are required" });
    }

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    let data;

    if (room === "all") {
      data = await waterUseageService.fetchHourlyByFloor(date, floor);
    } else {
      data = await waterUseageService.fetchHourlyByRoom(date, floor, room);
    }

    return res.json({ success: true, data });
  } catch (err) {
    console.error("getHourlyUsage error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
