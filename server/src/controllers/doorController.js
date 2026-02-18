import {
  getStatusHandler,
  handleBatchCommand,
} from "../utils/controllerWrapper.js";
import * as IoTService from "../services/iotService.js";

const deviceType = "doors";

export const getDoorsStatus = getStatusHandler(deviceType);
export const doorsBatchControl = handleBatchCommand(
  deviceType,
  IoTService.executeDoorAction,
);
