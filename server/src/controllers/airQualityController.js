import {
  formatDeviceMetadata,
  formatRankingData,
} from "../utils/responseFormatter.js";
import * as IoTService from "../services/iotService.js";

const baseType = "sensors";
const airQualityIdInitials = "MT";

const acceptedTypes = ["temp", "pm25", "pm10", "smoke", "co", "co2"];
const acceptedOrder = ["best", "worst"];

export const getAirQualityMetadata = async (req, res) => {
  try {
    const aqList = [];
    const allSensorList = await IoTService.fetchDeviceList(baseType);

    if (!allSensorList) {
      return res.json({
        success: false,
        error: "Air quality devices are not available",
      });
    }

    Object.keys(allSensorList).forEach((key) => {
      if (key.startsWith(airQualityIdInitials)) {
        aqList.push(key);
      }
    });

    const deviceMetadata = formatDeviceMetadata(aqList);
    return res.json({ success: true, data: deviceMetadata });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAirQualityRoomData = async (req, res) => {
  const deviceId = req.params.id;
  const allSensorList = await IoTService.fetchDeviceList(baseType);
  const singleRoomData = allSensorList[deviceId];
  return res.json({ success: true, data: singleRoomData });
};

export const getAirQualityByType = async (req, res) => {
  const aqType = req.query.type;
  const orderBy = req.query.orderby;

  if (!aqType || !orderBy) {
    return res.json({
      success: false,
      error: "air-quality type and order are required",
    });
  }

  if (!acceptedTypes.includes(aqType)) {
    return res.json({
      success: false,
      error:
        "Please enter valid air-quality type (temp, pm25, pm10, smoke, co, co2)",
    });
  }

  if (!acceptedOrder.includes(orderBy)) {
    return res.json({
      success: false,
      error: "Please enter valid air-quality order (best, worst)",
    });
  }

  try {
    const aqListByType = [];
    const allSensorList = await IoTService.fetchDeviceList(baseType);

    Object.entries(allSensorList).forEach(([key, values]) => {
      if (key.startsWith(airQualityIdInitials)) {
        const dataKey = aqType.replace(".", "");
        const reading = values[dataKey];

        aqListByType.push({
          [key]: { [aqType]: reading },
        });
      }
    });

    const mappedData = formatRankingData(aqType, aqListByType, orderBy);
    return res.json({ success: true, data: mappedData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
