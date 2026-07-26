import { useMemo, useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import RoomOverviewCard from "./RoomOverviewCard";

const mergeRoomsByFloor = (groups, floorNum) => {
  const byRoom = new Map();

  groups.forEach((group) => {
    const rooms = group.data[floorNum] || [];

    rooms.forEach((room) => {
      const roomKey = room.room_id ?? room.name;

      if (!byRoom.has(roomKey)) {
        byRoom.set(roomKey, {
          room_id: roomKey,
          name: room.name,
          floor: room.floor,
          study_seats: room.study_seats,
          exam_seats: room.exam_seats,
          counts: {},
        });
      }

      const entry = byRoom.get(roomKey);
      const existing = entry.counts[group.key] || { on: 0, total: 0 };

      entry.counts[group.key] = {
        on: existing.on + (room.isOn ? 1 : 0),
        total: existing.total + 1,
      };
    });
  });

  return Array.from(byRoom.values());
};

function RoomOverviewList({ floorNum, groups }) {
  const [search, setSearch] = useState("");

  const rooms = useMemo(
    () => mergeRoomsByFloor(groups, floorNum),
    [groups, floorNum],
  );

  const filteredRooms = useMemo(() => {
    if (!search.trim()) return rooms;
    const query = search.trim().toLowerCase();
    return rooms.filter((room) => room.name?.toLowerCase().includes(query));
  }, [rooms, search]);

  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      <Input
        size="large"
        placeholder="Search"
        suffix={<SearchOutlined />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 390, borderRadius: 6 }}
      />

      <div className="flex flex-col" style={{ gap: 24 }}>
        {filteredRooms.map((room) => (
          <RoomOverviewCard key={room.room_id} room={room} groups={groups} />
        ))}
      </div>
    </div>
  );
}

export default RoomOverviewList;
