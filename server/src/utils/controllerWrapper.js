import * as IoTService from "../services/iotService.js";
import { syncIotDevice } from "../services/socketService.js";
import { formatDeviceUpdate } from "../utils/responseFormatter.js";
import { handleError } from "../utils/errorFormatter.js";
import { logIotAction, logSystemEvent } from "../services/dbService.js";
import {
  getDeviceByHardwareId,
  getAllDeviceIdsByType,
  getAllDevicesByRoomId,
} from "./deviceMap.js";

export const EXECUTION_REGISTRY = {
  valves: IoTService.executeValveAction,
  doors: IoTService.executeDoorAction,
  default: IoTService.executeBatch,
};

export const getStatusHandler = (deviceType) => async (req, res) => {
  try {
    const data = await IoTService.fetchStatusByType(deviceType);

    if (!data) {
      throw {
        status: 503,
        message: `${deviceType} status is currently unavailable.`,
      };
    }

    const groupedData = formatDeviceUpdate(data, deviceType);
    return res.status(200).json({ success: true, data: groupedData });
  } catch (error) {
    return handleError(res, error, `getStatusHandler [${deviceType}]`);
  }
};

const runBatch = async (deviceType, normalizedDeviceIds, action, value, userId) => {
  const execute = EXECUTION_REGISTRY[deviceType] || EXECUTION_REGISTRY.default;

  const result = await execute(deviceType, normalizedDeviceIds, action, value);

  const successes = result.filter(
    (r) => r && r.status === 200 && r.data?.success === true,
  );
  const failures = result.filter(
    (r) => !r || r.status !== 200 || r.data?.success !== true,
  );

  successes.forEach((resItem) => {
    const mappings = getDeviceByHardwareId(resItem.id);
    mappings?.forEach((meta) => {
      logIotAction(meta.id, action, userId);
      logSystemEvent(
        "device-control",
        "info",
        "CONTROL_SUCCESS",
        `User ${userId} Switched ${action.toUpperCase()} ${meta.device_id}`,
        {
          roomId: meta.room_id,
          action: action,
          device: meta.device_id,
          action_time: new Date().toISOString(),
          action_by: userId,
        },
      );
    });
  });

  failures.forEach((f) => {
    const mappings = getDeviceByHardwareId(f.id);

    const errorMessage =
      f.data?.detail ||
      f.data?.error ||
      f.error ||
      f.data?.message ||
      `Hardware error (Status ${f.status || "???"})`;

    mappings?.forEach((meta) => {
      logSystemEvent(
        "device-control",
        "warn",
        "CONTROL_FAIL",
        `User ${userId} failed to turn ${action.toUpperCase()} ${meta.device_id}`,
        {
          roomId: meta.room_id,
          action: action,
          device: meta.device_id,
          action_time: new Date().toISOString(),
          action_by: userId,
          error: errorMessage,
        },
      );
    });
  });

  await syncIotDevice(deviceType);

  return { successes, failures };
};

const respondWithResults = (successes, failures, res) => {
  if (successes.length === 0 && failures.length > 0) {
    const first = failures[0];
    const errorMessage =
      first.data?.detail ||
      first.data?.error ||
      first.error ||
      first.data?.message ||
      `Hardware error (Status ${first.status || "???"})`;

    return res.status(502).json({
      success: false,
      message: errorMessage,
      failCount: failures.length,
    });
  }

  if (failures.length > 0) {
    const first = failures[0];
    const errorMessage =
      first.data?.detail ||
      first.data?.error ||
      first.error ||
      first.data?.message ||
      `Hardware error (Status ${first.status || "???"})`;

    return res.status(200).json({
      success: true,
      partial: true,
      message: errorMessage,
      successCount: successes.length,
      failCount: failures.length,
    });
  }

  return res.status(200).json({ success: true });
};

const runBatchAndRespond = async (
  deviceType,
  normalizedDeviceIds,
  action,
  value,
  userId,
  res,
) => {
  const { successes, failures } = await runBatch(
    deviceType,
    normalizedDeviceIds,
    action,
    value,
    userId,
  );

  return respondWithResults(successes, failures, res);
};

export const handleBatchCommand = (deviceType) => async (req, res) => {
  const { deviceIds, action, value = null } = req.body;
  const userId = req.user?.id || null;

  try {
    if (!deviceIds || !Array.isArray(deviceIds) || !action) {
      throw {
        status: 400,
        message: "deviceIds (array) and action are required!",
      };
    }

    const normalizedDeviceIds = deviceIds.map((item) => {
      if (typeof item === "object" && item !== null) {
        return { id: item.id, sub_id: item.sub_id || null };
      }
      return { id: String(item), sub_id: null };
    });

    return await runBatchAndRespond(
      deviceType,
      normalizedDeviceIds,
      action,
      value,
      userId,
      res,
    );
  } catch (error) {
    return handleError(res, error, `handleBatchCommand: ${deviceType}`);
  }
};

export const handleControlAllCommand = (deviceType) => async (req, res) => {
  const { action, value = null } = req.body;
  const userId = req.user?.id || null;

  try {
    if (!action) {
      throw { status: 400, message: "action is required!" };
    }

    const normalizedDeviceIds = getAllDeviceIdsByType(deviceType);

    if (normalizedDeviceIds.length === 0) {
      throw {
        status: 404,
        message: `No ${deviceType} devices found in the mapping cache.`,
      };
    }

    return await runBatchAndRespond(
      deviceType,
      normalizedDeviceIds,
      action,
      value,
      userId,
      res,
    );
  } catch (error) {
    return handleError(res, error, `handleControlAllCommand: ${deviceType}`);
  }
};

export const handleRoomControlAll = async (req, res) => {
  const { roomId } = req.params;
  const { action, value = null } = req.body;
  const userId = req.user?.id || null;

  try {
    if (!action) {
      throw { status: 400, message: "action is required!" };
    }

    const devicesByType = getAllDevicesByRoomId(roomId);
    const types = Object.keys(devicesByType);

    if (types.length === 0) {
      throw {
        status: 404,
        message: `No devices found for room ${roomId}.`,
      };
    }

    const allSuccesses = [];
    const allFailures = [];

    for (const deviceType of types) {
      const { successes, failures } = await runBatch(
        deviceType,
        devicesByType[deviceType],
        action,
        value,
        userId,
      );
      allSuccesses.push(...successes);
      allFailures.push(...failures);
    }

    return respondWithResults(allSuccesses, allFailures, res);
  } catch (error) {
    return handleError(res, error, `handleRoomControlAll: room ${roomId}`);
  }
};
