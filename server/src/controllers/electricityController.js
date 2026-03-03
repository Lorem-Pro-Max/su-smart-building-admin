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
  try {
    const { floor, device } = req.query;

    if (!floor || !device) {
      return res.status(400).json({
        error: "Floor and Device are required",
      });
    }

    const data = await electricityService.fetchDailyUsage({
      floor,
      device,
    });

    return res.json({ data });
  } catch (err) {
    console.error("getDailyUsage error:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
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
