import { metaWithoutRoom } from "../data/mockMeta.js";
import {
  electricDailyUsageData,
  electricHourlyUsageData,
} from "../data/electronicMockData.js";

export const getMetadata = (req, res) => {
  const data = metaWithoutRoom;

  if (!data)
    return res.status(404).json({ error: "electricity metadata not found" });
  res.json({ data: data });
};

export const getDailyUsage = (req, res) => {
  const { floor } = req.query;

  if (!floor) return res.status(400).json({ error: "floor is required" });
  const data = electricDailyUsageData[floor];

  if (!data)
    return res
      .status(404)
      .json({ error: "Daily electricity usage data not found" });

  if (floor === "all") {
    res.json({ data: data });
  } else {
    res.json({ data: { [floor]: data } });
  }
};

export const getHourlyUsage = (req, res) => {
  const { date, floor } = req.query;

  if (!floor || !date)
    return res.status(400).json({ error: "date and floor are required" });
  const data = electricHourlyUsageData[date][floor];

  if (!data)
    return res
      .status(404)
      .json({ error: "Hourly electricity usage data not found" });

  if (floor === "all") {
    res.json({ data: data });
  } else {
    res.json({ data: { [floor]: data } });
  }
};
