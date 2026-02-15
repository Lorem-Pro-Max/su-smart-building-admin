import { getStatusHandler, handleBatchCommand } from "../utils/controllerWrapper.js"

const deviceType = "exhaustFans"

export const getExhaustFansStatus = getStatusHandler(deviceType)
export const exhaustFansBatchControl = handleBatchCommand(deviceType)

