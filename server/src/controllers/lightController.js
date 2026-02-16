import { getStatusHandler, handleBatchCommand } from "../utils/controllerWrapper.js"

const deviceType = "lights"

export const getLightsStatus = getStatusHandler(deviceType)
export const lightsBatchControl = handleBatchCommand(deviceType)
