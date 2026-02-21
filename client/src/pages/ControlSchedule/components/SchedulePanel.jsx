import { Button, DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import RoomSelectModal from "./RoomSelectModal.jsx";
import DeviceSelectModal from "./DeviceSelectModal";
import SummaryModal from "./SummaryModal.jsx";
import {
  BulbOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  CloudOutlined,
  EyeOutlined,
  FireOutlined,
} from "@ant-design/icons";

const colorMap = {
  1: "#FAAD14",
  3: "#13C2C2",
  5: "#2F54EB",
  2: "#EB2F96",
  4: "#52C41A",
  6: "#722ED1",
  7: "#FA541C",
  8: "#A0D911",
  9: "#1677FF",
};

const iconMap = {
  1: <BulbOutlined />,
  2: (
    <img
      src="src/assets/icons/schedule/fan.svg"
      alt="room"
      className="w-6 h-6"
    />
  ),
  3: (
    <img
      src="src/assets/icons/schedule/room.svg"
      alt="room"
      className="w-6 h-6"
    />
  ),
  4: <DashboardOutlined />,
  5: (
    <img
      src="src/assets/icons/schedule/temp.svg"
      alt="room"
      className="w-6 h-6"
    />
  ),
  6: <ThunderboltOutlined />,
  7: <CloudOutlined />,
  8: <FireOutlined />,
  9: <EyeOutlined />,
};

function SchedulePanel({ selectedDate, onClose }) {
  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [room, setRoom] = useState(null);
  const [openDeviceModal, setOpenDeviceModal] = useState(false);
  const [devices, setDevices] = useState([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [settingType, setSettingType] = useState("on");
  const [dateValue, setDateValue] = useState(selectedDate);
  const [timeValue, setTimeValue] = useState(null);

  const removeDevice = (id) =>
    setDevices((prev) => prev.filter((d) => d.id !== id));

  const handleConfirmDevices = (selected) => {
    return setDevices((prev) => [
      ...prev,
      ...selected.filter((s) => !prev.find((d) => d.id === s.id)),
    ]);
  };

  const shadowCard =
    "mt-3 p-4 rounded-[16px] bg-white shadow-[1px_2px_10px_0px_#8E8E8E40] flex gap-6 items-center cursor-pointer transition";

  return (
    <>
      <div className="w-full max-w-[400px] h-[95vh] bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-semibold">ตั้งเวลาเปิด-ปิด อุปกรณ์</h2>
          <p className="text-gray-500 mb-6">
            กรุณาระบุข้อมูลเพื่อกำหนดการเปิด-ปิด อุปกรณ์
          </p>

          <div className="mb-6">
            <div className="flex justify-between align-center">
              <label className="font-medium">
                ห้องหรือพื้นที่ <span className="text-[#F5222D]">*</span>
              </label>
              {room && (
                <Button
                  type="primary"
                  color="cyan"
                  variant="solid"
                  onClick={() => setOpenRoomModal(true)}
                >
                  เปลี่ยน
                </Button>
              )}
            </div>
            <div onClick={() => setOpenRoomModal(true)} className={shadowCard}>
              <div className="w-[60px] h-[60px] rounded-xl flex items-center justify-center shrink-0">
                {room ? (
                  <div className="w-full h-full rounded-xl flex items-center justify-center bg-[#22C1B4]">
                    <img
                      src="src/assets/icons/schedule/room.svg"
                      alt="room"
                      className="w-[26px] h-[26px]"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-xl flex items-center justify-center bg-teal-50 text-teal-500">
                    <PlusOutlined className="text-[25px]" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="text-[18px] font-semibold text-black">
                  {room ? room.title : "เลือกห้องหรือพื้นที่"}
                </div>

                {room ? (
                  <>
                    <div className="text-sm text-gray-600 mt-1">
                      ชั้น {room.floor}
                    </div>
                    <div className="text-sm text-gray-500">
                      {room.building.name}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 mt-1">
                    อาคารการเรียนการสอนและปฏิบัติการคณะวิทยาศาสตร์
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between align-center">
              <label className="font-medium">
                อุปกรณ์ <span className="text-[#F5222D]">*</span>
              </label>
              {devices.length > 0 && (
                <Button
                  type="primary"
                  color="cyan"
                  variant="solid"
                  onClick={() => setOpenDeviceModal(true)}
                >
                  เพิ่มอุปกรณ์
                </Button>
              )}
            </div>

            <div
              onClick={() => setOpenDeviceModal(true)}
              className={shadowCard}
            >
              <div className="!w-[70px] !h-[70px] rounded-xl bg-teal-50 flex items-center justify-center text-teal-500 text-xl">
                <PlusOutlined className="text-[25px]" />
              </div>

              <div>
                <div className="font-medium">เพิ่มอุปกรณ์</div>
                <div className="text-xs text-gray-500">
                  อาคารการเรียนการสอนและปฎิบัติการ คณะวิทยาศาสตร์
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {devices.map((device) => {
                const typeId = device.device_type?.id;
                const color = colorMap[typeId] || "#13C2C2";

                return (
                  <div
                    key={device.id}
                    className="p-4 rounded-2xl border border-gray-200 flex justify-between items-center"
                  >
                    <div className="flex gap-4 items-center">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg"
                        style={{ background: color }}
                      >
                        {iconMap[typeId]}
                      </div>

                      <div>
                        <div className="font-medium">
                          {device.device_type?.type}
                        </div>
                        <div className="text-xs text-gray-500">
                          ชั้น {device.room?.floor || "-"} ·{" "}
                          {device.room?.title || "-"}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="small"
                      className="!bg-red-500 !text-white  p-3 rounded-[px] text-xs font-medium hover:opacity-90 transition"
                      onClick={() => removeDevice(device.id)}
                    >
                      ลบอุปกรณ์
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label className="font-medium">
                ประเภทการตั้งค่า <span className="text-[#F5222D]">*</span>
              </label>

              <div className="bg-gray-200 p-1 flex rounded-2xl w-[150px]">
                <button
                  type="button"
                  onClick={() => setSettingType("on")}
                  className={`flex-1 rounded-l-2xl text-base font-semibold transition ${
                    settingType === "on"
                      ? "bg-white text-green-500 shadow"
                      : "text-gray-500"
                  }`}
                >
                  เปิด
                </button>

                <button
                  type="button"
                  onClick={() => setSettingType("off")}
                  className={`flex-1 py-1 rounded-r-2xl text-base font-semibold transition ${
                    settingType === "off"
                      ? "bg-white text-gray-700 shadow"
                      : "text-gray-500"
                  }`}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="font-medium">
              วันที่ทำการจอง <span className="text-[#F5222D]">*</span>
            </label>
            <DatePicker
              className="w-full !mt-2"
              value={dateValue ? dayjs(dateValue) : null}
              onChange={(d) => setDateValue(d)}
              placeholder="เลือกวัน"
            />
          </div>

          <div className="mb-6">
            <label className="font-medium">
              เวลา <span className="text-[#F5222D]">*</span>
            </label>
            <TimePicker
              className="w-full !mt-2"
              format="HH:mm"
              value={timeValue}
              onChange={(t) => setTimeValue(t)}
              placeholder="เลือกเวลา"
            />
          </div>

          <div>
            <label className="font-medium">
              ผู้ตั้งเวลา <span className="text-[#F5222D]">*</span>
            </label>
            <div className="mt-2">ดวงจันทร์ จันทร์กระจ่าง</div>
          </div>
        </div>

        <div className="flex">
          <Button className="flex-1 !h-[48px] !rounded-[0px]" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            type="primary"
            color="cyan"
            className="flex-1 !h-[48px] !rounded-[0px]"
            disabled={!room || devices.length === 0 || !dateValue || !timeValue}
            onClick={() => setOpenSummary(true)}
          >
            ถัดไป
          </Button>
        </div>
      </div>

      <RoomSelectModal
        open={openRoomModal}
        onClose={() => setOpenRoomModal(false)}
        onSelect={setRoom}
      />

      <DeviceSelectModal
        open={openDeviceModal}
        onClose={() => setOpenDeviceModal(false)}
        onConfirm={handleConfirmDevices}
        roomId={room?.id}
      />

      <SummaryModal
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        room={room?.room}
        devices={devices}
        settingType={settingType}
        date={dateValue}
        time={timeValue}
        bookingId={room?.booking_id}
        userId={1}
        onCloseAll={onClose}
      />
    </>
  );
}

export default SchedulePanel;
