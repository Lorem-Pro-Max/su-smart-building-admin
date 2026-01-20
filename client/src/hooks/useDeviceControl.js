import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/devices";

export function useDeviceControl(data, config, onRefresh) {
  const [selectedByFloor, setSelectedByFloor] = useState({});
 
  const handleSelectAll = (floorNum, isChecked) => {
    const roomsObj = data[floorNum] || {};
    const roomIds = Object.keys(roomsObj);
    setSelectedByFloor((prev) => ({
      ...prev,
      [floorNum]: isChecked ? roomIds : [],
    }));
  };

  const handleSelectRoom = (floorNum, id) => {
    setSelectedByFloor((prev) => {
      const currentSelected = prev[floorNum] || [];
      const newSelection = currentSelected.includes(id)
        ? currentSelected.filter((item) => item !== id)
        : [...currentSelected, id];
      return { ...prev, [floorNum]: newSelection };
    });
  };

  const handleSingleToggle = async (roomId, isTurningOn) => {
    const action = isTurningOn ? config.actions.on : config.actions.off;
    try {
      await axios.post(`${BASE_URL}/api/batch-control`, {
        deviceIds: [roomId],
        action: action,
      });

      setTimeout(() => {
        if (onRefresh) onRefresh();
      }, 300);
    } catch (error) {
      console.error("Single toggle failed", error);
    }
  };

  const handleExecuteAction = async (floorNum, actionKey) => {
    const apiAction = config.actions[actionKey];
    const selected = selectedByFloor[floorNum] || [];
    const roomsObj = data[floorNum] || {};
    const allOnFloor = Object.keys(roomsObj);

    const isAllSelected =
      selected.length === allOnFloor.length || selected.length === 0;
    const endpoint = isAllSelected ? "/api/control-all" : "/api/batch-control";
    const payload = isAllSelected
      ? { action: apiAction }
      : { deviceIds: selected, action: apiAction };

    try {
      await axios.post(`${BASE_URL}${endpoint}`, payload);
      alert("Success!");
      setTimeout(() => {
        if (onRefresh) onRefresh();
      }, 300);
    } catch (error) {
      console.error("Backend communication failed", error);
    }
  };

  return {
    selectedByFloor,
    handleSelectAll,
    handleSelectRoom,
    handleSingleToggle,
    handleExecuteAction,
  };
}
