import TabsMenu from "./TabsMenu";
import PageHeader from "./PageHeader";
import {
  RoomControl,
  RoomControlBody,
  RoomControlMenu,
  RoomCard,
  RoomNotFound,
} from "./RoomControl";
import { useDeviceSelection } from "@hooks/devices/useDeviceSelection";

function Container({
  pageIcon,
  pageButtonIcon,
  pageTitle,
  dataState = {},
  control,
  alternatePageTitle = "",
  extraColumn = null,
}) {
  const { data } = dataState;
  const { handleExecuteAction, handleSingleToggle, contextHolder } = control;
  const { selectedByFloor, handleSelectAll, handleSelectRoom, clearSelection } =
    useDeviceSelection(data);

  return (
    <>
      {contextHolder}
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
                  onOpen={() => {
                    const ids =
                      selected.length > 0 ? selected : allRoomIdsOnFloor;
                    handleExecuteAction(ids, "on");
                    setTimeout(() => {
                      clearSelection(floorNum);
                    }, 500);
                  }}
                  onClose={() => {
                    const ids =
                      selected.length > 0 ? selected : allRoomIdsOnFloor;
                    handleExecuteAction(ids, "off");
                    setTimeout(() => {
                      clearSelection(floorNum);
                    }, 500);
                  }}
                />
                <RoomControlBody
                  onSelectAll={(e) =>
                    handleSelectAll(floorNum, e.target.checked)
                  }
                  isAllSelected={isAllSelected}
                  isIndeterminate={isIndeterminate}
                  extraColumnTitle={extraColumn?.title ?? null}
                >
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      id={room.id}
                      roomName={room.name}
                      checked={selected.includes(room.id)}
                      onCheck={() => handleSelectRoom(floorNum, room.id)}
                      isOn={room.isOn}
                      onToggle={(isOn) => handleSingleToggle(room.id, isOn)}
                      extraColumnDevice={
                        extraColumn && {
                          device: extraColumn?.device,
                          extraValue:
                            room.status[extraColumn.extraValue] ?? null,
                          extraControl: extraColumn?.extraControl,
                        }
                      }
                    ></RoomCard>
                  ))}
                </RoomControlBody>
              </RoomControl>
            );
          }}
        </TabsMenu>
      </PageHeader>
    </>
  );
}

export default Container;
