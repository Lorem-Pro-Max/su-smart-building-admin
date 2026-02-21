import { Modal, Button, notification } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { createSchedules } from "../../../services/schedule";
import {
  BulbOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
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
  2: <img src="src/assets/icons/schedule/fan.svg" className="w-6 h-6" />,
  3: <img src="src/assets/icons/schedule/room.svg" className="w-6 h-6" />,
  4: <DashboardOutlined />,
  5: <img src="src/assets/icons/schedule/temp.svg" className="w-6 h-6" />,
  6: <ThunderboltOutlined />,
  7: <CloudOutlined />,
  8: <FireOutlined />,
  9: <EyeOutlined />,
};

function SummaryModal({
  open,
  onClose,
  room,
  devices = [],
  settingType,
  date,
  time,
  userId,
  onCloseAll,
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);

      const deviceIds = devices.map((d) => d.id);

      const actionTime = dayjs(date)
        .hour(dayjs(time).hour())
        .minute(dayjs(time).minute())
        .second(0)
        .toISOString();

      await createSchedules({
        device_ids: deviceIds,
        action: settingType,
        action_time: actionTime,
        action_by: userId,
      });

      notification.success({
        message: "บันทึกการตั้งเวลาเรียบร้อยแล้ว",
      });

      onClose();
      onCloseAll();
    } catch (error) {
      console.error(error);
      notification.error({
        message: "เกิดข้อผิดพลาดในการบันทึก",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="95%"
      style={{ maxWidth: 1200 }}
    >
      <div className="p-4 md:p-8">
        <h2 className="text-lg md:text-2xl font-semibold text-center">
          สรุปข้อมูลการตั้งเปิด-ปิด อุปกรณ์
        </h2>

        <div className="border border-gray-200 rounded-2xl p-4 md:p-8 space-y-8 mt-6">
          {room && (
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 shadow-sm w-[300px]">
              <div className="w-14 h-14 rounded-xl bg-teal-500 flex items-center justify-center">
                <img
                  src="src/assets/icons/schedule/room.svg"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <div className="font-semibold text-lg">{room.title}</div>
                <div className="text-sm text-gray-600">ชั้น {room.floor}</div>
                <div className="text-xs text-gray-500">
                  {room.building?.name}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {devices.map((device) => {
              const typeId = device.device_type?.id;
              const color = colorMap[typeId] || "#13C2C2";

              return (
                <div
                  key={device.id}
                  className="p-4 rounded-2xl border border-gray-200 flex items-center gap-4 shadow-sm w-[300px]"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                    style={{ background: color }}
                  >
                    {iconMap[typeId] || <BulbOutlined />}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {device.device_type?.type}
                    </div>
                    <div className="text-xs text-gray-500">
                      ชั้น {device.room?.floor} · {device.room?.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-gray-500 text-sm">ประเภท</div>
              <div
                className={`font-semibold ${
                  settingType === "open" ? "text-green-600" : "text-red-500"
                }`}
              >
                {settingType === "open" ? "เปิด" : "ปิด"}
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-sm">วันที่</div>
              <div>{date ? dayjs(date).format("DD MMM YYYY") : "-"}</div>
            </div>

            <div>
              <div className="text-gray-500 text-sm">เวลา</div>
              <div>{time ? dayjs(time).format("HH:mm") + " น." : "-"}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <Button className="flex-1 h-12 rounded-xl" onClick={onClose}>
            แก้ไขข้อมูล
          </Button>

          <Button
            type="primary"
            loading={loading}
            onClick={handleConfirm}
            className="flex-1 h-12 !rounded-xl !bg-teal-500 hover:!bg-teal-600"
          >
            ยืนยันการจอง
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SummaryModal;
