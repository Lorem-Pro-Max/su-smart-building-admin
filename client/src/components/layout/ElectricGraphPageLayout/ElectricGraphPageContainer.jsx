import { useState, useMemo } from "react";
import {
  ElectricGraphPageHeader,
  TabsMenu,
  RoomControlMenu,
  RoomCard,
  RoomControlBody,
  RoomControl,
  RoomNotFound,
  ElectricGraphContainer,
  ElectricDaysGraph,
  ElectricHoursGraph,
} from "@components/layout";
import {
  useDeviceSelection,
  getDeviceUid,
} from "@hooks/devices/useDeviceSelection";
import { useElectricGraphSelection } from "../../../hooks/graph/useElectricGraphSelection";

function ElectricGraphPageContainer({
  pageIcon,
  pageTitle,
  pageButtonIcon,
  graphService,
  dataState = {},
  control = {},
  displayConfig,
  totalUsageIcon,
  alternateTitle,
}) {
  const { data } = dataState;
  const { multiTabs, defaultPage } = displayConfig;
  const { handleExecuteAction, handleSingleToggle, contextHolder } = control;
  const { selectedByFloor, handleSelectAll, handleSelectRoom, clearSelection } =
    useDeviceSelection(data);

  const [currentPage, setCurrentPage] = useState(defaultPage);

  const selectionService = useMemo(() => {
    if (currentPage !== "dashboard") return null;

    const { graphState, fetchDailyByFloor, fetchHourlyByFloor } = graphService;
    return useElectricGraphSelection(graphState, {
      fetchDailyByFloor,
      fetchHourlyByFloor,
    });
  }, [currentPage, graphService]);

  const metadata =
    currentPage === "dashboard" ? graphService.graphState.metadata || {} : {};

  return (
    <>
      {contextHolder}
      <ElectricGraphPageHeader
        pageIcon={pageIcon}
        pageTitle={pageTitle}
        multiTabs={multiTabs}
        onSwitchPage={setCurrentPage}
        currentPage={currentPage}
      >
        <div key="page-content-wrapper" className="w-full h-full">
          {currentPage === "dashboard" ? (
            <ElectricGraphContainer key="dashboard-view">
              <ElectricDaysGraph
                title={pageTitle}
                data={graphService.graphState.daily.data}
                selectionService={selectionService}
                metadata={metadata}
                alternateTitle={alternateTitle}
              />
              <ElectricHoursGraph
                title={pageTitle}
                data={graphService.graphState.hourly.data}
                selectionService={selectionService}
                totalUsageIcon={totalUsageIcon}
                metadata={metadata}
                alternateTitle={alternateTitle}
              />
            </ElectricGraphContainer>
          ) : (
            <div key="control-view">
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
                              roomName={room.name}
                              checked={selected.includes(uid)}
                              onCheck={() => handleSelectRoom(floorNum, uid)}
                              isOn={room.isOn}
                              onToggle={(isOn) => handleSingleToggle(uid, isOn)}
                            />
                          );
                        })}
                      </RoomControlBody>
                    </RoomControl>
                  );
                }}
              </TabsMenu>
            </div>
          )}
        </div>
      </ElectricGraphPageHeader>
    </>
  );
}

export default ElectricGraphPageContainer;
