import { Button, DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import RoomSelectModal from "./RoomSelectModal.jsx";
import DeviceSelectModal from "./DeviceSelectModal";
import SummaryModal from "./SummaryModal.jsx";
import { PlusOutlined } from "@ant-design/icons";

function SchedulePanel({ selectedDate, onClose }) {
  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [room, setRoom] = useState(null);
  const [openDeviceModal, setOpenDeviceModal] = useState(false);
  const [devices, setDevices] = useState([]);
  const [openSummary, setOpenSummary] = useState(false);
  const [settingType, setSettingType] = useState("open");
  const [dateValue, setDateValue] = useState(selectedDate);
  const [timeValue, setTimeValue] = useState(null);

  const removeDevice = (id) =>
    setDevices((prev) => prev.filter((d) => d.id !== id));

  const handleConfirmDevices = (selected) =>
    setDevices((prev) => [
      ...prev,
      ...selected.filter((s) => !prev.find((d) => d.id === s.id)),
    ]);

  const shadowCard =
    "mt-3 p-4 rounded-[16px] bg-white shadow-[1px_2px_10px_0px_#8E8E8E40] flex gap-6 items-center cursor-pointer transition";

  return (
    <>
      <div className="w-full max-w-[400px] h-auto bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-semibold">ตั้งเวลาเปิด-ปิด อุปกรณ์</h2>
          <p className="text-gray-500 mb-6">
            กรุณาระบุข้อมูลเพื่อกำหนดการเปิด-ปิด อุปกรณ์
          </p>

          <div className="mb-6">
            <label className="font-medium">
              ห้องหรือพื้นที่ <span className="text-[#F5222D]">*</span>
            </label>

            <div onClick={() => setOpenRoomModal(true)} className={shadowCard}>
              <div className="w-[60px] h-[60px] rounded-xl flex items-center justify-center shrink-0">
                {room ? (
                  <div className="w-full h-full rounded-xl flex items-center justify-center bg-[#22C1B4]">
                    <img
                      src="/src/assets/icons/schedule/room.svg"
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
                  {room ? room.name : "เลือกห้องหรือพื้นที่"}
                </div>

                {room ? (
                  <>
                    <div className="text-sm text-gray-600 mt-1">
                      ชั้น {room.floor}
                    </div>
                    <div className="text-sm text-gray-500">
                      อาคารการเรียนการสอนและปฏิบัติการคณะวิทยาศาสตร์
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
            <label className="font-medium">
              อุปกรณ์ <span className="text-[#F5222D]">*</span>
            </label>

            <div
              onClick={() => setOpenDeviceModal(true)}
              className={shadowCard}
            >
              <div className="!w-[70px] !h-[70px] rounded-xl bg-teal-50 flex items-center justify-center text-teal-500 text-xl">
                <PlusOutlined />
              </div>

              <div>
                <div className="font-medium">เพิ่มอุปกรณ์</div>
                <div className="text-xs text-gray-500">
                  อาคารการเรียนการสอนและปฎิบัติการ คณะวิทยาศาสตร์
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="p-4 rounded-2xl border border-gray-200 flex justify-between items-center"
                >
                  <div className="flex gap-4 items-center">
                    <div
                      className="w-12 h-12 rounded-xl"
                      style={{ background: device.color }}
                    />
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-xs text-gray-500">
                        ชั้น {room?.floor || "-"} · {room?.name || "-"}
                      </div>
                    </div>
                  </div>

                  <Button
                    danger
                    size="small"
                    onClick={() => removeDevice(device.id)}
                  >
                    ลบอุปกรณ์
                  </Button>
                </div>
              ))}
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
                  onClick={() => setSettingType("open")}
                  className={`flex-1 rounded-l-2xl text-base font-semibold transition ${
                    settingType === "open"
                      ? "bg-white text-green-500 shadow"
                      : "text-gray-500"
                  }`}
                >
                  เปิด
                </button>

                <button
                  type="button"
                  onClick={() => setSettingType("close")}
                  className={`flex-1 py-1 rounded-r-2xl text-base font-semibold transition ${
                    settingType === "close"
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
            disabled={!room || devices.length === 0}
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
      />

      <SummaryModal
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        room={room}
        devices={devices}
        settingType={settingType}
        date={dateValue}
        time={timeValue}
      />
    </>
  );
}

export default SchedulePanel;
