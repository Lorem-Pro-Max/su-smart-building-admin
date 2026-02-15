import {
  getStatusHandler,
  handleBatchCommand,
} from "../utils/controllerWrapper.js";
import { formatDoorsUpdate } from "../utils/responseFormatter.js";

const deviceType = "doors";

export const getDoorsStatus = getStatusHandler(deviceType, formatDoorsUpdate);
export const doorsBatchControl = handleBatchCommand(
  deviceType,
  "executeDoorAction",
);
