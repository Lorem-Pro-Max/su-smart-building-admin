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
import { useDeviceSelection } from "@hooks/devices/useDeviceSelection";

function Container({
  pageIcon,
  pageButtonIcon,
  pageTitle,
  dataState = {},
  control,
  alternatePageTitle = "",
  extraColumnTitle = null,
  extraColumn = null,
}) {
  const { data } = dataState;
  const { handleExecuteAction, handleSingleToggle } = control;
  const { selectedByFloor, handleSelectAll, handleSelectRoom } =
    useDeviceSelection(data);

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
          const allRoomIdsOnFloor = rooms.map((room) => room.id);

          if (rooms.length === 0) return <RoomNotFound />;

          const isAllSelected =
            rooms.length > 0 && selected.length === rooms.length;
          const isIndeterminate =
            selected.length > 0 && selected.length < rooms.length;

          return (
            <RoomControl>
              <RoomControlMenu
                title={pageTitle}
                ButtonIcon={pageButtonIcon}
                floor={floorNum}
                selectedCount={selected.length}
                onOpen={() =>
                  handleExecuteAction(
                    selected.length > 0 ? selected : allRoomIdsOnFloor,
                    "on",
                  )
                }
                onClose={() =>
                  handleExecuteAction(
                    selected.length > 0 ? selected : allRoomIdsOnFloor,
                    "off",
                  )
                }
              />
              <RoomControlBody
                onSelectAll={(e) => handleSelectAll(floorNum, e.target.checked)}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                extraColumnTitle={extraColumnTitle}
              >
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    roomName={`ห้อง ${room.id}`}
                    checked={selected.includes(room.id)}
                    onCheck={() => handleSelectRoom(floorNum, room.id)}
                    isOn={room.isOn}
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
