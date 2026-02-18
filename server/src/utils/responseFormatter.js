import { deviceCache } from "../services/socketService.js";

const STATUS_RESOLVERS = {
  doors: (status) => ({
    ...status,
    power: status.door1_state !== "CLOSE" || status.door2_state !== "CLOSE",
  }),
};

export const formatDeviceUpdate = (iotStatusData, deviceType) => {
  const grouped = {};

  for (const [id, status] of Object.entries(iotStatusData)) {
    const meta = deviceCache[id];

    if (meta) {
      const { floor, title, type } = meta;
      if (!grouped[floor]) grouped[floor] = [];

      const resolver = STATUS_RESOLVERS[deviceType];
      const finalStatus = resolver ? resolver(status) : status;

      grouped[floor].push({
        id: id,
        name: title,
        type: type,
        status: finalStatus,
        floor: floor,
      });
    }
  }

  return grouped;
};

export const formatDeviceMetadata = (deviceIds) => {
  const metadata = {
    available_floors: [],
    available_rooms: {},
  };

  for (const id of deviceIds) {
    const meta = deviceCache[id];

    if (meta) {
      const { floor, title } = meta;
      const floorKey = `floor_${floor}`;

      if (!metadata.available_rooms[floorKey]) {
        metadata.available_rooms[floorKey] = [];
      }
      metadata.available_rooms[floorKey].push({
        key: id,
        label: title,
      });

      const floorExists = metadata.available_floors.some(
        (item) => item.key === floorKey,
      );

      if (!floorExists) {
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

export const formatRankingData = (type, rawAqList, orderBy) => {
  const typeMapping = {
    pm25: "PM 2.5",
    pm10: "PM 10",
    temp: "Temp",
    co: "CO",
    co2: "CO2",
    smoke: "Smoke",
  };

  const enriched = rawAqList.map((item) => {
    const id = Object.keys(item)[0];
    const value = item[id];
    const meta = deviceCache[id];

    return {
      id,
      type: type,
      value: value[type],
      type_title: typeMapping[type],
      room_title: meta?.title || null,
      floor: meta?.floor || null,
    };
  });

  return enriched.sort((a, b) =>
    orderBy === "best" ? a.value - b.value : b.value - a.value,
  );
};
