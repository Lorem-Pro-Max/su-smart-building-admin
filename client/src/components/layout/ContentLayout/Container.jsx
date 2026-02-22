import TabsMenu from "./TabsMenu";
import PageHeader from "./PageHeader";
import {
  RoomControl,
  RoomControlBody,
  RoomControlMenu,
  RoomCard,
  RoomNotFound,
} from "./RoomControl";
import {
  useDeviceSelection,
  getDeviceUid,
} from "@hooks/devices/useDeviceSelection";

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
            const allRoomUidsOnFloor = rooms.map(getDeviceUid);

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
                      selected.length > 0 ? selected : allRoomUidsOnFloor;
                    handleExecuteAction(ids, "on");
                    setTimeout(() => clearSelection(floorNum), 500);
                  }}
                  onClose={() => {
                    const ids =
                      selected.length > 0 ? selected : allRoomUidsOnFloor;
                    handleExecuteAction(ids, "off");
                    setTimeout(() => clearSelection(floorNum), 500);
                  }}
                />
                <RoomControlBody
                  onSelectAll={(e) =>
                    handleSelectAll(floorNum, e.target.checked)
                  }
                  isAllSelected={isAllSelected}
                  isIndeterminate={isIndeterminate}
                >
                  {rooms.map((room) => {
                    const uid = getDeviceUid(room);

                    return (
                      <RoomCard
                        key={uid}
                        id={uid}
                        roomName={room.name}
                        checked={selected.includes(uid)}
                        onCheck={() => handleSelectRoom(floorNum, uid)}
                        isOn={room.isOn}
                        onToggle={(isOn) => handleSingleToggle(uid, isOn)}
                        extraColumnDevice={
                          extraColumn && {
                            device: extraColumn?.device,
                            extraValue:
                              room.status[extraColumn.extraValue] ?? null,
                            extraControl: extraColumn?.extraControl,
                          }
                        }
                      />
                    );
                  })}
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
