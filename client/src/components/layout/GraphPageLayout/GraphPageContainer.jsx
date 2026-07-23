import { useState, useMemo } from "react";
import {
  GraphPageHeader,
  TabsMenu,
  RoomControlMenu,
  RoomCard,
  RoomControlBody,
  RoomControl,
  RoomNotFound,
  GraphContainer,
  DaysGraph,
  HoursGraph,
} from "@components/layout";
import {
  useDeviceSelection,
  getDeviceUid,
} from "@hooks/devices/useDeviceSelection";
import { useGraphSelection } from "@hooks/graph/useGraphSelection";
import { LoadingScreen } from "../../utils";

function GraphPageContainer({
  pageIcon,
  pageTitle,
  pageButtonIcon,
  graphService,
  dataState = {},
  control = {},
  displayConfig,
  totalUsageIcon,
  alternateTitle,
  buildingControl = null,
}) {
  const { data } = dataState;
  const { multiTabs, defaultPage } = displayConfig;
  const { handleExecuteAction, handleSingleToggle, contextHolder } = control;
  const { selectedByFloor, handleSelectAll, handleSelectRoom, clearSelection } =
    useDeviceSelection(data);

  const [currentPage, setCurrentPage] = useState(defaultPage);

  const selectionService = useMemo(() => {
    if (currentPage !== "dashboard") return null;

    const { graphState, fetchDaily, fetchHourly } = graphService;
    return useGraphSelection(graphState, {
      fetchDaily,
      fetchHourly,
    });
  }, [currentPage, graphService]);

  const metadata =
    currentPage === "dashboard" ? graphService.graphState.metadata || {} : {};

  return (
    <>
      {contextHolder}
      {graphService.graphState.isLoading && <LoadingScreen />}
      <GraphPageHeader
        pageIcon={pageIcon}
        pageTitle={pageTitle}
        multiTabs={multiTabs}
        onSwitchPage={setCurrentPage}
        currentPage={currentPage}
      >
        <div key="page-content-wrapper" className="w-full h-full">
          {currentPage === "dashboard" ? (
            <GraphContainer key="dashboard-view">
              <DaysGraph
                title={pageTitle}
                data={graphService.graphState.daily.data}
                selectionService={selectionService}
                metadata={metadata}
                alternateTitle={alternateTitle}
              />
              <HoursGraph
                title={pageTitle}
                data={graphService.graphState.hourly.data}
                selectionService={selectionService}
                totalUsageIcon={totalUsageIcon}
                metadata={metadata}
                alternateTitle={alternateTitle}
              />
            </GraphContainer>
          ) : (
            <div key="control-view">
              {buildingControl && (
                <div className="w-full flex justify-end pb-4">
                  {buildingControl}
                </div>
              )}
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
      </GraphPageHeader>
    </>
  );
}

export default GraphPageContainer;
