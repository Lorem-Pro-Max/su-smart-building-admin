import {
  formatDeviceMetadata,
  formatRankingData,
} from "../utils/responseFormatter.js";
import * as IoTService from "../services/iotService.js";

const baseType = "sensor";
const airQualityIdInitials = "MT";

export const getAirQualityMetadata = async (req, res) => {
  const aqList = [];
  const allSensorList = await IoTService.fetchDeviceList(baseType);

  Object.keys(allSensorList).forEach((key) => {
    if (key.startsWith(airQualityIdInitials)) {
      aqList.push(key);
    }
  });

  const deviceMetadata = formatDeviceMetadata(aqList);
  return res.json({ success: true, data: deviceMetadata });
};

export const getAirQualityRoomData = async (req, res) => {
  const deviceId = req.params.id;
  const allSensorList = await IoTService.fetchDeviceList(baseType);
  const singleRoomData = allSensorList[deviceId];

  return res.json({ success: true, data: singleRoomData });
};

export const getAirQualityByType = async (req, res) => {
  const acceptedTypes = ["temp", "pm25", "pm10", "smoke", "co", "co2"];
  const acceptedOrder = ["best", "worst"];

  const aqType = req.query.type;
  const orderBy = req.query.orderby;

  if (!aqType || !orderBy) {
        return res.json({
      success: false,
      error:
        "air-quality type and order are required",
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
};
