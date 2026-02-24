import * as useageService from "../services/useageService.js";
import { handleError } from "../utils/errorFormatter.js";

export const GetAllUsageStats = async (req, res) => {
  try {
    const { type } = req.params; // 'water' หรือ 'electric'
    const days = req.query.days ? parseInt(req.query.days) : 7;

    const tableMap = {
      water: "water_usage_hourly",
      electric: "electricity_useage_hourly",
    };

    const tableName = tableMap[type];
    if (!tableName) throw { status: 400, message: "Invalid type" };

    const rawData = await useageService.fetchAllDevicesUsageHistory(
      tableName,
      days,
    );

    const formattedData = rawData.reduce((acc, row) => {
      const key = row.iot_code; // เช่น "sci-101"

      if (!acc[key]) {
        acc[key] = {
          label: row.room_label,
          total_usage: 0,
          data: [],
        };
      }

      const dailyValue = parseFloat(row.daily_value || 0);
      acc[key].total_usage += dailyValue;
      acc[key].data.push({
        date: row.usage_date.toISOString().split("T")[0], // format: YYYY-MM-DD
        value: dailyValue,
      });

      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    return handleError(res, error, `GET /api/usage/${req.params.type}/all`);
  }
};
