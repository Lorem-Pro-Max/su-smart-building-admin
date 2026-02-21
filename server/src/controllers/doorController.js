import {
  getStatusHandler,
  handleBatchCommand,
} from "../utils/controllerWrapper.js";

const deviceType = "doors";

export const getDoorsStatus = getStatusHandler(deviceType);
export const doorsBatchControl = handleBatchCommand(deviceType);
