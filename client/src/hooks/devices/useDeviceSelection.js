import { useState, useEffect } from "react";

export function useDeviceSelection(data = {}) {
  const [selectedByFloor, setSelectedByFloor] = useState({});

  useEffect(() => {
    setSelectedByFloor((prev) => {
      const newSelection = { ...prev };
      let hasChanged = false;

      Object.keys(newSelection).forEach((floor) => {
        const currentSelected = newSelection[floor] || [];

        const floorRooms = data[floor] || [];
        const availableIds = floorRooms.map((room) => String(room.id));

        const filtered = currentSelected.filter((id) =>
          availableIds.includes(String(id)),
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
    const roomIds = Array.isArray(rooms)
      ? rooms.map((r) => r.id)
      : Object.keys(rooms);

    setSelectedByFloor((prev) => ({
      ...prev,
      [floorNum]: isChecked ? roomIds : [],
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
