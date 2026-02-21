import { getIO } from "../config/socket.js";
import { logSystemEvent } from "./dbService.js";
import { getDeviceByHardwareId } from "../utils/deviceMap.js";

export const processSmokeDetection = (sensorId) => {
  try {
    const deviceMeta = getDeviceByHardwareId(sensorId);
    
    if (!deviceMeta) {
      throw new Error(`Smoke trigger from unmapped Sensor ID: ${sensorId}`);
    }

    const io = getIO();

    io.emit("smoke_alert", {
      sensorId: sensorId,
      floor: deviceMeta.floor,
      room: deviceMeta.title,
      message: "ตรวจพบควันไฟ",
    });

    logSystemEvent(
      "security",
      "fatal",
      "SMOKE_DETECTED",
      `Smoke alarm triggered in ${deviceMeta.title} (Floor ${deviceMeta.floor})`,
      { sensorId }
    );

  } catch (error) {
    logSystemEvent("socket", "warn", "SMOKE_PROCESS_FAIL", error.message, {
      sensorId,
    });
  }
};