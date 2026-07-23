import { getStatusHandler, handleBatchCommand, handleControlAllCommand } from "../utils/controllerWrapper.js"

const deviceType = "lights"

export const getLightsStatus = getStatusHandler(deviceType)
export const lightsBatchControl = handleBatchCommand(deviceType)
export const lightsControlAll = handleControlAllCommand(deviceType)
