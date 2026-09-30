import { useState, useEffect } from "react";

export const getDeviceUid = (room) => {
  return room.device_sub_id
    ? `${room.id}::${room.device_sub_id}`
    : String(room.id);
};

export function useDeviceSelection(data = {}) {
  const [selectedByFloor, setSelectedByFloor] = useState({});

  useEffect(() => {
    setSelectedByFloor((prev) => {
      const newSelection = { ...prev };
      let hasChanged = false;

      Object.keys(newSelection).forEach((floor) => {
        const currentSelected = newSelection[floor] || [];

        const floorRooms = data[floor] || [];
        const availableUids = floorRooms.map(getDeviceUid);

        const filtered = currentSelected.filter((uid) =>
          availableUids.includes(String(uid))
        );

        if (filtered.length !== currentSelected.length) {
          newSelection[floor] = filtered;
          hasChanged = true;
        }
      });

      return hasChanged ? newSelection : prev;
    });
  }, [data]);

  const handleSelectAll = (floorNum, isChecked) => {
    const rooms = data[floorNum] || [];
    const roomUids = Array.isArray(rooms)
      ? rooms.map(getDeviceUid)
      : Object.values(rooms).map(getDeviceUid);

    setSelectedByFloor((prev) => ({
      ...prev,
      [floorNum]: isChecked ? roomUids : [],
    }));
  };

  const handleSelectRoom = (floorNum, id) => {
    setSelectedByFloor((prev) => {
      const current = prev[floorNum] || [];
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...prev, [floorNum]: next };
    });
  };

  const clearSelection = (floorNum) => {
    setSelectedByFloor((prev) => ({
      ...prev,
      [floorNum]: [],
    }));
  };

  return { selectedByFloor, handleSelectAll, handleSelectRoom, clearSelection };
}
