import { getDeviceByHardwareId } from "../utils/deviceMap.js";

const STATUS_RESOLVERS = {
  doors: (status) => ({
    power: status.door1_state !== "CLOSE" || status.door2_state !== "CLOSE",
  }),
  valves: (status, subId) => {
    let isPowerOn = false;
    if (subId === "v1") {
      isPowerOn = status.valve1_status === "OPEN";
    } else if (subId === "v2") {
      isPowerOn = status.valve2_status === "OPEN";
    }
    return { power: isPowerOn };
  },
};

export const formatDeviceUpdate = (iotStatusData, deviceType) => {
  const grouped = {};

  for (const [id, status] of Object.entries(iotStatusData)) {
    const meta = getDeviceByHardwareId(id);

    if (meta) {
      const { floor, title, type, key, device_sub_id } = meta;
      if (!grouped[floor]) grouped[floor] = [];

      const resolver = STATUS_RESOLVERS[deviceType];
      const finalStatus = resolver ? resolver(status, device_sub_id) : status;

      grouped[floor].push({
        id: id,
        key: key,
        name: title,
        type: type,
        status: finalStatus,
        floor: floor,
        device_sub_id: device_sub_id,
      });
    }
  }

  return grouped;
};

export const formatDeviceMetadata = (deviceIds) => {
  const metadata = { available_floors: [], available_rooms: {} };

  for (const id of deviceIds) {
    const meta = getDeviceByHardwareId(id);

    if (meta) {
      const { floor, title, key, device_sub_id } = meta;
      const floorKey = `floor_${floor}`;

      if (!metadata.available_rooms[floorKey]) {
        metadata.available_rooms[floorKey] = [];
      }

      metadata.available_rooms[floorKey].push({
        key: id,
        label: title,
        type: key,
        device_sub_id: device_sub_id || null,
      });

      if (!metadata.available_floors.some((item) => item.key === floorKey)) {
        metadata.available_floors.push({
          key: floorKey,
          label: `ชั้น ${floor}`,
        });
      }
    }
  }
  metadata.available_floors.sort((a, b) => a.key.localeCompare(b.key));
  return metadata;
};

export const formatAirQualityRankingData = (type, rawAqList, orderBy) => {
  const typeMapping = {
    pm25: "PM 2.5",
    pm10: "PM 10",
    temp: "Temp",
    co: "CO",
    co2: "CO2",
    smoke: "Smoke",
  };

  const enriched = [];

  rawAqList.forEach((item) => {
    const id = Object.keys(item)[0];
    const value = item[id];
    const meta = getDeviceByHardwareId(id);

    if (meta) {
      enriched.push({
        id: `${id}_${meta.key}`,
        type: type,
        value: value[type],
        type_title: typeMapping[type],
        room_title: meta.title,
        floor: meta.floor,
      });
    }
  });

  return enriched.sort((a, b) =>
    orderBy === "best" ? a.value - b.value : b.value - a.value,
  );
};
