import WebSocket from "ws";
import { getIO } from "../config/socket.js";
import { formatDeviceUpdate } from "../utils/responseFormatter.js";
import {
  fetchDeviceMapping,
  fetchRoomDevice,
  fetchRoomSensor,
} from "./dbService.js";
import * as IoTService from "./iotService.js";
import * as useageService from "./useageService.js";
import { processHumanDetection } from "./humanDetectionService.js";
import { processSmokeDetection } from "./smokeDetectionService.js";
import { logSystemEvent } from "./dbService.js";

const SOCKET_URL = process.env.WEBSOCKET_URL;

export let deviceCache = {
  byId: {},
  byDeviceId: {},
  byRoomId: {},
};

const DEVICE_PREFIX_MAP = {
  VA: "valves",
  DO: "doors",
  IR: "ac",
  SW: "lights",
  FA: "exhaustFans",
  MT: "sensors",
};

const SMOKE_DETECTION_PREFIX = "SD";
const HUMAN_DETECTION_PREFIX = "HP";
const WATER_USEAGE_PREFIX = "VA";
const ELECTRICITY_ELP_PREFIX = "ELP";
const ELECTRICITY_LP_PREFIX = "LP";

export const initDeviceMapping = async () => {
  try {
    const rows = await fetchDeviceMapping();
    const roomRows = await fetchRoomDevice();
    const sensorRows = await fetchRoomSensor();

    if (!rows || rows.length === 0) {
      deviceCache = {
        byId: {},
        byDeviceId: {},
        byRoomId: {},
        byRoomSensor: {},
      };
      return;
    }

    const byId = {};
    const byDeviceId = {};
    const byRoomId = {};
    const byRoomSensor = {};

    rows.forEach((row) => {
      byId[row.id] = row;
      if (!byDeviceId[row.device_id]) byDeviceId[row.device_id] = [];
      byDeviceId[row.device_id].push(row);
    });

    roomRows.forEach((row) => {
      if (!byRoomId[row.id]) byRoomId[row.id] = [];
      byRoomId[row.id].push({
        deviceId: row.device_id,
        type: row.key,
        deviceSubId: row.device_sub_id,
      });
    });

    sensorRows.forEach((row) => {
      if (!byRoomSensor[row.room_id]) byRoomSensor[row.room_id] = [];
      byRoomSensor[row.room_id].push(row.device_id);
    });

    deviceCache = { byId, byDeviceId, byRoomId, byRoomSensor };
  } catch (error) {
    logSystemEvent("server", "error", "MAPPING_ERROR", error.message);
    console.error("[Server] Critical Mapping Error. Check system_log");
    deviceCache = { byId: {}, byDeviceId: {}, byRoomId: {}, byRoomSensor: {} };
  }
};

export const emitDeviceUpdate = (room, data) => {
  const io = getIO();
  io.to(room).emit(`${room}_update`, data);
};

export const syncIotDevice = async (deviceType) => {
  try {
    const rawData = await IoTService.fetchStatusByType(deviceType);
    emitDeviceUpdate(deviceType, formatDeviceUpdate(rawData, deviceType));
  } catch (error) {}
};

const throttles = new Map();
const throttleMillisec = 1000;
let waterBuffer = {};
let electricBuffer = {};

let lastWsErrorLog = 0;
const WS_ERROR_LOG_INTERVAL = 5 * 60 * 1000;

setInterval(async () => {
  await useageService.processWaterUsageBuffer(waterBuffer, deviceCache);
}, useageService.USEAGE_UPSERT_INTERVAL);

setInterval(async () => {
  await useageService.processElectricityUsageBuffer(electricBuffer);
}, useageService.USEAGE_UPSERT_INTERVAL);

export const initIotSocketListener = () => {
  const ws = new WebSocket(SOCKET_URL);

  let isAlive = true;
  let pingInterval = null;

  const connectionTimeout = setTimeout(() => {
    if (ws.readyState === WebSocket.CONNECTING) {
      console.warn(
        "[Websocket] Connection hanging in CONNECTING state. Forcing retry...",
      );
      ws.terminate();
    }
  }, 5000);

  ws.on("open", () => {
    clearTimeout(connectionTimeout);
    console.log("[Websocket] IoT server connected");
    isAlive = true;

    pingInterval = setInterval(() => {
      if (isAlive === false) {
        console.warn(
          "[Websocket] Connection drop detected. Terminating socket...",
        );
        return ws.terminate();
      }

      isAlive = false;
      ws.ping();
    }, 30000);
  });

  ws.on("pong", () => {
    isAlive = true;
  });

  ws.on("message", (data) => {
    try {
      const rawData = JSON.parse(data.toString());
      const topic = rawData.topic;
      const payload = rawData.payload;

      if (!topic) throw new Error("Missing topic in IoT payload");

      const parts = topic.split("/");
      const fullId = parts[1];

      if (fullId) {
        const prefix = fullId.substring(0, 2);
        const deviceType = DEVICE_PREFIX_MAP[prefix];
        const prefixELP = fullId.substring(0, 3);

        if (SMOKE_DETECTION_PREFIX === prefix) {
          processSmokeDetection(fullId, payload);
          return;
        }

        if (HUMAN_DETECTION_PREFIX === prefix) {
          processHumanDetection(fullId, rawData.payload.motion);
          return;
        }

        if (WATER_USEAGE_PREFIX === prefix) {
          useageService.processWaterData(payload, waterBuffer);
          return;
        }

        if (ELECTRICITY_ELP_PREFIX === prefixELP) {
          const mappedDevices = deviceCache.byDeviceId[fullId];
          const deviceId = mappedDevices[0].id;

          if (!mappedDevices || mappedDevices.length === 0) {
            console.warn(`[Mapping Missing] ${fullId}`);
            return;
          }

          useageService.processElecticityData(
            payload,
            deviceId,
            electricBuffer,
          );
          return;
        }

        if (ELECTRICITY_LP_PREFIX === prefix) {
          const mappedDevices = deviceCache.byDeviceId[fullId];
          const deviceId = mappedDevices[0].id;

          if (!mappedDevices || mappedDevices.length === 0) {
            console.warn(`[Mapping Missing] ${fullId}`);
            return;
          }

          useageService.processElecticityData(
            payload,
            deviceId,
            electricBuffer,
          );
          return;
        }

        if (deviceType) {
          const now = Date.now();
          const lastRun = throttles.get(deviceType) || 0;

          if (now - lastRun >= throttleMillisec) {
            throttles.set(deviceType, now);
            syncIotDevice(deviceType);
          }
        }
      }
    } catch (error) {
      console.error(`[Websocket] Unexpected Error: ${error.message}`);
    }
  });

  ws.on("error", (err) => {
    const now = Date.now();
    if (now - lastWsErrorLog > WS_ERROR_LOG_INTERVAL) {
      lastWsErrorLog = now;
      logSystemEvent("socket", "error", "WS_ERROR", err.message);
    } else {
      console.error(`[Websocket Error] ${err.message}`);
    }
  });

  ws.on("close", () => {
    clearTimeout(connectionTimeout);
    if (pingInterval) clearInterval(pingInterval);

    ws.removeAllListeners();

    console.warn("[Websocket] IoT connection lost. Retrying in 5s...");
    setTimeout(initIotSocketListener, 5000);
  });
};
