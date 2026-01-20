import { useDeviceControl } from "@hooks/useDeviceControl";
import TabsMenu from "./TabsMenu";
import PageHeader from "./PageHeader";
import {
  RoomControl,
  RoomControlBody,
  RoomControlMenu,
  RoomCard,
  RoomNotFound,
} from "./RoomControl";
import React from "react";

function Container({
  pageIcon,
  pageButtonIcon,
  pageTitle,
  data = {},
  onRefresh,
  config,
  alternatePageTitle = "",
  extraColumnTitle = null,
  extraColumn = null,
}) {
  const {
    selectedByFloor,
    handleSelectAll,
    handleSelectRoom,
    handleSingleToggle,
    handleExecuteAction,
  } = useDeviceControl(data, config, onRefresh);

  return (
    <PageHeader
      pageIcon={pageIcon}
      pageTitle={pageTitle}
      alternatePageTitle={alternatePageTitle}
    >
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
                onSelectAll={(e) => handleSelectAll(floorNum, e.target.checked)}
                isAllSelected={
                  rooms.length > 0 && selected.length === rooms.length
                }
                isIndeterminate={
                  selected.length > 0 && selected.length < rooms.length
                }
                extraColumnTitle={extraColumnTitle}
              >
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    roomName={`ห้อง ${room.id}`}
                    checked={selected.includes(room.id)}
                    onCheck={() => handleSelectRoom(floorNum, room.id)}
                    isOn={room.status === config.deviceStatus.on}
                    onToggle={(isOn) => handleSingleToggle(room.id, isOn)}
                  >
                    {extraColumn && React.cloneElement(extraColumn, { room })}
                  </RoomCard>
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
