import { Modal, Tabs, Button, notification, Spin } from "antd";
import { useState, useEffect } from "react";
import { getAllBooking } from "../../../services/schedule";

function RoomSelectModal({ open, onClose, onSelect }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomsByFloor, setRoomsByFloor] = useState({});
  const [floorList, setFloorList] = useState([]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await getAllBooking();
      const data = res.data;

      setRoomsByFloor(data);

      const floors = Object.keys(data)
        .map(Number)
        .sort((a, b) => a - b);

      setFloorList(floors);
    } catch {
      notification.error({ message: "โหลดข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchRooms();
  }, [open]);

  const renderRoomCard = (room) => {
    const isActive = selectedRoom?.id === room.id;

    return (
      <div
        key={room.id}
        onClick={() => setSelectedRoom(room)}
        className={`flex gap-4 p-5 rounded-2xl cursor-pointer transition-all bg-white shadow-md hover:shadow-lg ${
          isActive ? "ring-2 ring-teal-500" : ""
        }`}
      >
        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-teal-500 shrink-0">
          <img
            src="src/assets/icons/schedule/room.svg"
            alt="room"
            className="w-6 h-6"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-base md:text-lg font-semibold truncate">
            {room.title}
          </div>

          <div className="text-sm text-gray-500 mt-1">ชั้น {room.floor}</div>

          <div className="text-sm text-gray-500 truncate">
            {room.building?.name}
          </div>
        </div>
      </div>
    );
  };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="90%"
      style={{ maxWidth: 1000 }}
      styles={{
        body: {
          maxHeight: "75vh",
          overflow: "auto",
        },
      }}
    >
      <h3 className="text-sm font-semibold mb-6">เลือกห้องหรือพื้นที่</h3>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <Tabs
          className="room-tabs"
          items={floorList.map((floor) => ({
            key: String(floor),
            label: (
              <span className="text-[16px] font-medium">ชั้นที่ {floor}</span>
            ),
            children: (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {(roomsByFloor[floor] || []).map((room) =>
                  renderRoomCard(room),
                )}
              </div>
            ),
          }))}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button className="flex-1 h-12" onClick={onClose}>
          ยกเลิก
        </Button>

        <Button
          type="primary"
          className="flex-1 h-12 !bg-teal-500"
          disabled={!selectedRoom}
          onClick={() => {
            onSelect(selectedRoom);
            onClose();
          }}
        >
          ยืนยัน
        </Button>
      </div>
    </Modal>
  );
}

export default RoomSelectModal;
