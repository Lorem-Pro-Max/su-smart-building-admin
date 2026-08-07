import { useEffect, useMemo, useState } from "react";
import { Select, Input, Checkbox, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getAllRooms } from "../../../services/user";

function RoomAccessSelect({ value: rawValue = [], onChange, disabled }) {
  const value = useMemo(() => (rawValue ?? []).map(Number), [rawValue]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getAllRooms()
      .then((res) => {
        const normalized = (res?.data || []).map((room) => ({
          ...room,
          id: Number(room.id),
        }));
        if (!cancelled) setRooms(normalized);
      })
      .catch(() => {
        if (!cancelled) setRooms([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rooms;
    return rooms.filter((room) =>
      String(room.title ?? "").toLowerCase().includes(query),
    );
  }, [rooms, search]);

  const isAllSelected = rooms.length > 0 && value.length === rooms.length;

  const summaryLabel = isAllSelected
    ? `ทั้งหมด (${rooms.length} ห้อง)`
    : `เลือกห้องบางส่วน (${value.length} ห้อง)`;

  const toggleRoom = (roomId) => {
    const next = value.includes(roomId)
      ? value.filter((id) => id !== roomId)
      : [...value, roomId];
    onChange?.(next);
  };

  const toggleSelectAll = () => {
    onChange?.(isAllSelected ? [] : rooms.map((room) => room.id));
  };

  return (
    <Select
      open={open}
      onDropdownVisibleChange={setOpen}
      disabled={disabled}
      value={value.length > 0 ? summaryLabel : undefined}
      placeholder="เลือกห้อง"
      dropdownRender={() => (
        <div className="p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">เลือกห้องเรียน</span>
            <Button type="link" size="small" onClick={toggleSelectAll}>
              {isAllSelected ? "ล้างค่าเลือกทั้งหมด" : "เลือกทั้งหมด"}
            </Button>
          </div>

          <Input
            size="small"
            placeholder="Search"
            suffix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-64 overflow-y-auto flex flex-col">
            {filteredRooms.length === 0 ? (
              <p className="text-center text-sm py-4">ไม่พบห้อง</p>
            ) : (
              filteredRooms.map((room) => {
                const checked = value.includes(room.id);
                return (
                  <label
                    key={room.id}
                    className="flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[#E6FFFB]"
                    style={{ background: checked ? "#E6FFFB" : undefined }}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={() => toggleRoom(room.id)}
                    />
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">{room.title}</span>
                      <span className="text-xs text-[#00000073]">
                        ชั้น {room.floor}
                      </span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    />
  );
}

export default RoomAccessSelect;
