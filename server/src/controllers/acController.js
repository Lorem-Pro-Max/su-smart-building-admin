import { getStatusHandler, handleBatchCommand } from "../utils/controllerWrapper.js"

const deviceType = "ac"

export const getAcStatus = getStatusHandler(deviceType)
export const acBatchControl = handleBatchCommand(deviceType)

