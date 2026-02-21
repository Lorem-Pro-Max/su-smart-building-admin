import WebSocket from "ws";
import { getIO } from "../config/socket.js";
import { formatDeviceUpdate } from "../utils/responseFormatter.js";
import { fetchDeviceMapping, fetchRoomDevice } from "./dbService.js";
import * as IoTService from "./iotService.js";
import { processHumanDetection } from "./humanDetectionService.js";

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
  SD: "smoke",
  MT: "sensors",
};

const SMOKE_DETECTION_PREFIX = "SM";
const HUMAN_DETECTION_PREFIX = "HP";

export const initDeviceMapping = async () => {
  try {
    const rows = await fetchDeviceMapping();
    const roomRows = await fetchRoomDevice();

    if (!rows || rows.length === 0) {
      deviceCache = { byId: {}, byDeviceId: {}, byRoomId: {} };
      return;
    }

    const byId = {};
    const byDeviceId = {};
    const byRoomId = {};

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
        deviceSubId: row.device_sub_id
      });
    });

    deviceCache = { byId, byDeviceId, byRoomId };
    
  } catch (error) {
    console.error("[Server] Mapping Error:", error.message);
    deviceCache = { byId: {}, byDeviceId: {}, byRoomId: {} };
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
    // console.log(`[IoT Websocket] Device sync: ${deviceType}`);
  } catch (error) {
    console.error(`[Websocket] Failed to sync '${deviceType}':`, error.message);
  }
};

const throttles = new Map();
const throttleMillisec = 1000;

export const initIotSocketListener = () => {
  const ws = new WebSocket(SOCKET_URL);

  ws.on("open", () => {
    console.log("[Websocket] IoT server connected");
  });

  ws.on("message", (data) => {
    try {
      const rawData = JSON.parse(data.toString());
      const topic = rawData.topic;

      if (!topic) {
        throw new Error(
          "[Websocket] Failed to receive update topic from IoT server",
        );
      }

      const parts = topic.split("/");
      const fullId = parts[1];

      if (fullId) {
        const prefix = fullId.substring(0, 2);
        const deviceType = DEVICE_PREFIX_MAP[prefix];

        if (SMOKE_DETECTION_PREFIX === prefix) {
          // syncIotDevice(deviceType);
          return;
        }

        if (HUMAN_DETECTION_PREFIX === prefix) {
          processHumanDetection(fullId, rawData.payload.motion);
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
      console.error("[Websocket] IoT device Update Error:", error.message);
    }
  });

  ws.on("error", (err) => {
    console.error("[Websocket] Failed to connect IoT server", err.message);
  });

  ws.on("close", () => {
    console.log("[Websocket] Connection closed. Retrying in 5s...");
    setTimeout(initIotSocketListener, 5000);
  });
};
