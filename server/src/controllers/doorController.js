import {
  getStatusHandler,
  handleBatchCommand,
  handleControlAllCommand,
} from "../utils/controllerWrapper.js";

const deviceType = "doors";

export const getDoorsStatus = getStatusHandler(deviceType);
export const doorsBatchControl = handleBatchCommand(deviceType);
export const doorsControlAll = handleControlAllCommand(deviceType);
