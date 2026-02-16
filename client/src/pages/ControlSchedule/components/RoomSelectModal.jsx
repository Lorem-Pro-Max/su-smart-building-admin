import { Modal, Tabs, Button } from "antd";
import { useState } from "react";

function RoomSelectModal({ open, onClose, onSelect }) {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const rooms = [
    "พื้นที่ A",
    "สัมมนา 1",
    "สัมมนา 2",
    "สัมมนา 3",
    "สัมมนา 4",
    "สัมมนา 5",
    "สัมมนา 6",
    "Present 1",
    "Computer 1",
    "Computer 2",
    "Computer 3",
    "Computer 4",
  ];

  const renderRoomCard = (room, floor) => {
    const isActive =
      selectedRoom?.name === room && selectedRoom?.floor === floor;

    return (
      <div
        key={`${room}-${floor}`}
        onClick={() => setSelectedRoom({ name: room, floor })}
        className={`
          flex items-center gap-4
          p-5
          rounded-[20px]
          cursor-pointer
          transition-all duration-200
          bg-[#FFFFFF]
          shadow-[1px_2px_10px_0px_#8E8E8E40]
          hover:shadow-[2px_4px_14px_0px_#8E8E8E50]
          ${isActive ? "ring-2 ring-teal-400 bg-white" : ""}
        `}
      >
        <div className="w-[56px] h-[56px] rounded-xl flex items-center justify-center bg-[#22C1B4] shrink-0">
          <img
            src="/src/assets/icons/schedule/room.svg"
            alt="room"
            className="w-[26px] h-[26px]"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-base md:text-lg font-semibold truncate">
            {room}
          </div>

          <div className="text-sm text-gray-500 mt-1">ชั้น {floor}</div>

          <div className="text-sm text-gray-500 truncate">
            อาคารการเรียนการสอนและปฏิบัติการคณะวิทยาศาสตร์
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
      width="90%"
      style={{ maxWidth: 1200 }}
      centered
    >
      <h3 className="text-xl font-semibold mb-6">เลือกห้องหรือพื้นที่</h3>

      <Tabs
        defaultActiveKey="3"
        items={[1, 2, 3, 4, 5].map((floor) => ({
          key: String(floor),
          label: `ชั้นที่ ${floor}`,
          children: (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                gap-5
                mt-6
              "
            >
              {rooms.map((room) => renderRoomCard(room, floor))}
            </div>
          ),
        }))}
      />

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
