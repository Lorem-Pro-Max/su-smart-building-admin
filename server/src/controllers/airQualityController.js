import {
  formatDeviceMetadata,
  formatAirQualityRankingData,
} from "../utils/responseFormatter.js";
import { handleError } from "../utils/errorFormatter.js";
import * as IoTService from "../services/iotService.js";

const baseType = "sensors";
const deviceType = "mt";
const airQualityIdInitials = "MT";

const acceptedTypes = ["temp", "pm25", "pm10", "smoke", "co", "co2"];
const acceptedOrder = ["best", "worst"];

export const getAirQualityMetadata = async (req, res) => {
  try {
    const allSensorList = await IoTService.fetchDeviceList(
      baseType,
      deviceType,
    );

    if (!allSensorList) {
      throw {
        status: 503,
        message: "Air quality devices are currently unavailable.",
      };
    }

    const deviceMetadata = formatDeviceMetadata(allSensorList);

    if (!deviceMetadata) {
      throw { status: 500, message: "Failed to process device metadata." };
    }

    return res.json({ success: true, data: deviceMetadata });
  } catch (error) {
    return handleError(res, error, "getAirQualityMetadata");
  }
};

export const getAirQualityRoomData = async (req, res) => {
  const deviceId = req.params.id;

  try {
    if (!deviceId) {
      throw { status: 400, message: "Device ID is required!" };
    }

    const allSensorList = await IoTService.fetchStatusByType(baseType);

    if (!allSensorList) {
      throw {
        status: 503,
        message: "The Air Quality system is currently offline.",
      };
    }

    const singleRoomData = allSensorList[deviceId];

    if (!singleRoomData) {
      throw {
        status: 404,
        message: `Sensor data for with ID ${deviceId} was not found.`,
      };
    }

    return res.status(200).json({ success: true, data: singleRoomData });
  } catch (error) {
    return handleError(res, error, `getAirQualityRoomData [${deviceId}]`);
  }
};

export const getAirQualityByType = async (req, res) => {
  const aqType = req.query.type;
  const orderBy = req.query.order;

  try {
    if (!aqType || !orderBy) {
      throw {
        status: 400,
        message: "Air-quality type and order are required parameters.",
      };
    }

    if (!acceptedTypes.includes(aqType)) {
      throw {
        status: 400,
        message: `Invalid type. Please use: ${acceptedTypes.join(", ")}`,
      };
    }

    if (!acceptedOrder.includes(orderBy)) {
      throw {
        status: 400,
        message: "Invalid order. Please use 'best' or 'worst'.",
      };
    }

    const allSensorList = await IoTService.fetchStatusByType(baseType);

    if (!allSensorList || Object.keys(allSensorList).length === 0) {
      throw {
        status: 503,
        message: "Could not retrieve sensor data for ranking.",
      };
    }

    const aqListByType = [];
    Object.entries(allSensorList).forEach(([key, values]) => {
      if (key.startsWith(airQualityIdInitials)) {
        const dataKey = aqType.replace(".", "");
        const reading = values[dataKey];

        aqListByType.push({
          [key]: { [aqType]: reading },
        });
      }
    });

    const mappedData = formatAirQualityRankingData(
      aqType,
      aqListByType,
      orderBy,
    );
    return res.json({ success: true, data: mappedData });
  } catch (error) {
    return handleError(res, error, "getAirQualityByType");
  }
};
