import { useState } from "react";
import axios from "axios";
import TabsMenu from "./TabsMenu";
import PageHeader from "./PageHeader";
import {
  RoomControl,
  RoomControlBody,
  RoomControlMenu,
  RoomCard,
  RoomNotFound,
} from "./RoomControl";

const DEFAULT_CONFIG = {
  actions: { on: "unlock", off: "lock" },
  statusOn: "unlocked",
  statusOff: "locked",
};

function Container({
  pageIcon,
  pageButtonIcon,
  pageTitle,
  data = {},
  onRefresh,
  config = DEFAULT_CONFIG,
}) {
  const [selectedByFloor, setSelectedByFloor] = useState({});

  const handleSelectAll = (floorNum, e) => {
    const roomsObj = data[floorNum] || {};
    const roomIds = Object.keys(roomsObj);
    setSelectedByFloor((prev) => ({
      ...prev,
      [floorNum]: e.target.checked ? roomIds : [],
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

  const handleSingleToggle = async (roomId, newStatus) => {
    const action =
      newStatus === config.statusOff ? config.actions.off : config.actions.on;

    try {
      await axios.post("http://localhost:4000/api/batch-control", {
        deviceIds: [roomId],
        action: action,
      });
      setTimeout(() => {
        if (onRefresh) onRefresh();
      }, 1000);
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
      await axios.post(`http://localhost:4000${endpoint}`, payload);
      alert("Success!");
      setTimeout(() => {
        if (onRefresh) onRefresh();
      }, 1000);
    } catch (error) {
      console.error("Backend communication failed", error);
    }
  };

  return (
    <PageHeader pageIcon={pageIcon} pageTitle={pageTitle}>
      <TabsMenu>
        {(floorNum) => {
          const roomsObj = data[floorNum] || {};
          const rooms = Object.values(roomsObj);
          const selected = selectedByFloor[floorNum] || [];

          if (rooms.length === 0) return <RoomNotFound />;

          return (
            <RoomControl>
              <RoomControlMenu
                title={pageTitle}
                ButtonIcon={pageButtonIcon}
                floor={floorNum}
                selectedCount={selected.length}
                onOpen={() => handleExecuteAction(floorNum, "on")}
                onClose={() => handleExecuteAction(floorNum, "off")}
              />
              <RoomControlBody
                onSelectAll={(e) => handleSelectAll(floorNum, e)}
                isAllSelected={
                  rooms.length > 0 && selected.length === rooms.length
                }
                isIndeterminate={
                  selected.length > 0 && selected.length < rooms.length
                }
              >
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    roomName={`ห้อง ${room.id}`}
                    checked={selected.includes(room.id)}
                    onCheck={() => handleSelectRoom(floorNum, room.id)}
                    status={room.status}
                    onStatusChange={(val) => handleSingleToggle(room.id, val)}
                    statusOn={config.statusOn}
                    statusOff={config.statusOff}
                  />
                ))}
              </RoomControlBody>
            </RoomControl>
          );
        }}
      </TabsMenu>
    </PageHeader>
  );
}

export default Container;
