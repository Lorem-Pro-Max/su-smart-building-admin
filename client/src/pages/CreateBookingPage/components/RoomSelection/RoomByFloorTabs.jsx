
import { Empty, Row, Tabs } from "antd";
import { useMemo, useState } from "react";
import RoomCard from "./RoomCard";


export default function RoomsByFloorTabs({
  roomsGroupedByFloor,
  tempSelectedRoom,
  onSelectTempRoom,
  disabledRoomIds = new Set(),
  filterSlot = null,
  hasActiveFilters = false,
}) {
  const [selectedFloorKey, setSelectedFloorKey] = useState(null);

  const floorTabItems = useMemo(() => {
    const sortedFloors = Array.from(roomsGroupedByFloor.keys()).sort(
      (firstFloorKey, secondFloorKey) => Number(firstFloorKey) - Number(secondFloorKey)
    );

    return sortedFloors.map((floorKey) => {
      const roomsOnThisFloor = roomsGroupedByFloor.get(floorKey) ?? [];

      return {
        key: floorKey,
        label: `ชั้นที่ ${floorKey}`,
        children: (
          <div className="overflow-y-auto overflow-x-hidden p-4 bg-[#F5F5F5] rounded-2xl">
            <Row gutter={[12, 12]}>
              {roomsOnThisFloor.map((roomItem) => (
                <RoomCard
                  key={roomItem.id ?? `${roomItem.floor}-${roomItem.title ?? roomItem.name}`}
                  roomItem={roomItem}
                  floorKey={floorKey}
                  tempSelectedRoom={tempSelectedRoom}
                  onSelectTempRoom={onSelectTempRoom}
                  disabled={disabledRoomIds.has(Number(roomItem.id))}
                />
              ))}
            </Row>
          </div>
        ),
      };
    });
  }, [roomsGroupedByFloor, tempSelectedRoom, onSelectTempRoom, disabledRoomIds]);

  const isSelectedFloorAvailable = floorTabItems.some((tabItem) => tabItem.key === selectedFloorKey);
  const activeFloorKey = isSelectedFloorAvailable ? selectedFloorKey : floorTabItems[0]?.key;

  if (!floorTabItems.length) {
    return (
      <div className="p-4 bg-[#F5F5F5] rounded-2xl">
        <div className="flex justify-end pb-2">{filterSlot}</div>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={hasActiveFilters ? "ไม่พบห้องที่ตรงกับตัวกรอง" : "ไม่พบห้อง"}
        />
      </div>
    );
  }

  return (
    <Tabs
      activeKey={activeFloorKey}
      onChange={setSelectedFloorKey}
      items={floorTabItems}
      tabBarExtraContent={{ right: filterSlot }}
      indicator={{ size: (origin) => origin - 20 }}
    />)
}
