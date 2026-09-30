import { Modal, Button, notification, Spin } from "antd";
import { useState, useEffect } from "react";
import { getRoomById } from "../../../services/schedule";
import {
  BulbOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  EyeOutlined,
  FireOutlined,
} from "@ant-design/icons";
import RoomIcon from "../../../assets/icons/schedule/DeviceLightIcon";
import FanIcon from "../../../assets/icons/schedule/FanIcon";
import TempIcon from "../../../assets/icons/schedule/TempIcon";

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
  2: <FanIcon />,
  3: <RoomIcon />,
  4: <DashboardOutlined />,
  5: <TempIcon />,
  6: <ThunderboltOutlined />,
  7: <CloudOutlined />,
  8: <FireOutlined />,
  9: <EyeOutlined />,
};

function DeviceSelectModal({ open, onClose, onConfirm, roomId }) {
  const [selected, setSelected] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await getRoomById(roomId);
      setDevices(data.data || []);
    } catch {
      notification.error({ message: "โหลดข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && roomId) {
      setSelected([]);
      fetchDevices();
    }
  }, [open, roomId]);

  const toggleDevice = (device) => {
    if (selected.find((d) => d.id === device.id)) {
      setSelected(selected.filter((d) => d.id !== device.id));
    } else {
      setSelected([...selected, device]);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 1000 }}
      styles={{
        body: {
          maxHeight: "75vh",
          overflow: "auto",
        },
      }}
      centered
    >
      <h3 className="mb-4 text-[16px] font-semibold">เลือกอุปกรณ์</h3>

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-base text-center">ไม่พบอุปกรณ์ หรือ อุปกรณ์ในห้องนี้ไม่รองรับการตั้งเวลาเปิด-ปิด</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((item) => {
              const active = selected.find((d) => d.id === item.id);
              const color = colorMap[item.device_type_id] || "#13C2C2";

              return (
                <div
                  key={item.id}
                  onClick={() => toggleDevice(item)}
                  className={`p-4 rounded-2xl cursor-pointer flex gap-3 items-center transition border ${active ? "border-[2px] border-[#13C2C2]" : "border-gray-200"
                    }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                    style={{ background: color }}
                  >
                    {iconMap[item.device_type_id] || <BulbOutlined />}
                  </div>

                  <div className="flex flex-col">
                    <div className="font-semibold">{item?.type}</div>
                    <div className="text-xs text-gray-500">
                      ชั้น {item?.floor} · {item?.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      อาคาร {item?.building_id}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <Button className="flex-1" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button
          type="primary"
          className="flex-1 !bg-[#13C2C2]"
          onClick={() => {
            onConfirm(selected);
            onClose();
          }}
        >
          ยืนยัน
        </Button>
      </div>
    </Modal>
  );
}

export default DeviceSelectModal;
