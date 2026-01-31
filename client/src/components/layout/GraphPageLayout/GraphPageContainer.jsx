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
import { useDeviceSelection } from "@hooks/devices/useDeviceSelection";
import { useGraphSelection } from "@hooks/graph/useGraphSelection";

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
}) {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { multiTabs } = displayConfig;
  const { data } = dataState || {};

  const { handleExecuteAction, handleSingleToggle } = control;
  const { selectedByFloor, handleSelectAll, handleSelectRoom } =
    useDeviceSelection(data);

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

  const renderControlView = () => (
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
            >
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  roomName={`ห้อง ${room.id}`}
                  checked={selected.includes(room.id)}
                  onCheck={() => handleSelectRoom(floorNum, room.id)}
                  isOn={room.isOn}
                  onToggle={(isOn) => handleSingleToggle(room.id, isOn)}
                />
              ))}
            </RoomControlBody>
          </RoomControl>
        );
      }}
    </TabsMenu>
  );

  return (
    <GraphPageHeader
      pageIcon={pageIcon}
      pageTitle={pageTitle}
      multiTabs={multiTabs}
      onSwitchPage={setCurrentPage}
      currentPage={currentPage}
    >
      {currentPage === "dashboard" ? (
        <GraphContainer>
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
        renderControlView()
      )}
    </GraphPageHeader>
  );
}

export default GraphPageContainer;
