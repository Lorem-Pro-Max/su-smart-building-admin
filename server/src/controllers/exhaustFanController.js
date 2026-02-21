import { getStatusHandler, handleBatchCommand } from "../utils/controllerWrapper.js"

const deviceType = "exhaust-fans"

export const getExhaustFansStatus = getStatusHandler(deviceType)
export const exhaustFansBatchControl = handleBatchCommand(deviceType)

