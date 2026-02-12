import { deviceCache } from "../services/socketService.js";

export const groupDevicesByFloor = (response) => {
  if (!response) return {};

  let list = [];

  if (
    response.data &&
    typeof response.data === "object" &&
    Array.isArray(response.data)
  ) {
    list = Object.values(response.data);
  } else if (response.data && Array.isArray(response.data)) {
    list = response.data;
  } else if (Array.isArray(response)) {
    list = response;
  }

  const grouped = {};

  list.forEach((device) => {
    const id = parseInt(device.id, 10);

    let floor = 1;

    if (!isNaN(id)) {
      if (id >= 100) {
        floor = Math.floor(id / 100);
      } else {
        floor = Math.ceil(id / 10);
      }
    }

    if (!grouped[floor]) grouped[floor] = [];
    grouped[floor].push(device);
  });

  return grouped;
};

export const formatProductionUpdate = (iotStatusData) => {
  const grouped = {};

  for (const [id, status] of Object.entries(iotStatusData)) {
    const meta = deviceCache[id];

    if (meta) {
      const { floor, title, type } = meta;
      if (!grouped[floor]) grouped[floor] = [];

      grouped[floor].push({
        id: id,
        name: title,
        type: type,
        status: status,
        floor: floor,
      });
    }
  }

  return grouped;
};

