import { metaWithoutRoom } from "../data/mockMeta.js";
import {
  electricDailyUsageData,
  electricHourlyUsageData,
} from "../data/electronicMockData.js";
import * as electricityService from "../services/electricityUseageService.js";

export const getMetadata = async (req, res) => {
  try {
    const data = await electricityService.getMetadata();
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
    const data = await electricityService.fetchDailyByFloor(floor);
    return res.json({ data: data });
  } else {
    const data = await electricityService.fetchDailyByRoom(floor, room);
    return res.json({ data: data });
  }
};

export const getHourlyUsage = async (req, res) => {
  const { date, floor, room } = req.query;
  try {
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
      data = await electricityService.fetchHourlyByFloor(date, floor);
    } else {
      data = await electricityService.fetchHourlyByRoom(date, floor, room);
    }

    return res.json({ success: true, data });
  } catch (err) {
    console.error("getHourlyUsage error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
