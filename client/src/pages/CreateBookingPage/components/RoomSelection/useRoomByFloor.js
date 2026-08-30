import { useMemo } from "react";

export default function useRoomsByFloor(rooms) {
  return useMemo(() => {
    const roomsGroupedByFloor = new Map();

    for (const roomItem of rooms) {
      const floorKey = String(roomItem.floor ?? "");
      if (!floorKey) continue;

      if (!roomsGroupedByFloor.has(floorKey)) {
        roomsGroupedByFloor.set(floorKey, []);
      }

      roomsGroupedByFloor.get(floorKey).push(roomItem);
    }

    for (const [floorKey, roomsOnFloor] of roomsGroupedByFloor.entries()) {
      roomsOnFloor.sort((firstRoom, secondRoom) =>
        String(firstRoom.title ?? firstRoom.name ?? "").localeCompare(
          String(secondRoom.title ?? secondRoom.name ?? "")
        )
      );

      roomsGroupedByFloor.set(floorKey, roomsOnFloor);
    }

    return roomsGroupedByFloor;
  }, [rooms]);
}
