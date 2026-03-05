import { getIO } from "../config/socket.js";
import { logSystemEvent } from "./dbService.js";
import { getDeviceByHardwareId } from "../utils/deviceMap.js";

const alertThrottles = new Map();
const ALERT_LOG_INTERVAL = 15000;

export const processSmokeDetection = (sensorId, payload) => {
  try {
    const alert = payload.smoke === "ALARM";
    if (!alert) return;

    const deviceMetaList = getDeviceByHardwareId(sensorId);

    if (!deviceMetaList || deviceMetaList.length === 0) {
      throw new Error(`Smoke trigger from unmapped Sensor ID: ${sensorId}`);
    }

    const io = getIO();
    const now = Date.now();

    deviceMetaList.forEach((deviceMeta) => {
      const throttleKey = `smoke:${sensorId}:${deviceMeta.room_id}`;
      const lastLogged = alertThrottles.get(throttleKey) || 0;

      if (now - lastLogged > ALERT_LOG_INTERVAL) {
        alertThrottles.set(throttleKey, now);

        io.emit("smoke_alert", {
          sensorId: sensorId,
          floor: deviceMeta.floor,
          room: deviceMeta.title,
          message: "ตรวจพบควันไฟ",
        });

        logSystemEvent(
          "socket",
          "fatal",
          "SMOKE_DETECTED",
          `Smoke alarm triggered in ${deviceMeta.title} (Floor ${deviceMeta.floor})`,
          { sensorId, roomId: deviceMeta.room_id },
        );
      }
    });
  } catch (error) {
    console.error(`[Smoke Detection Warning] ${error.message}`);
  }
};
