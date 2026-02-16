import { Modal, Button } from "antd";
import { useState } from "react";

function DeviceSelectModal({ open, onClose, onConfirm }) {
  const [selected, setSelected] = useState([]);

  const devices = [
    { id: 1, name: "ประตู", color: "#13C2C2" },
    { id: 2, name: "พัดลมดูดอากาศ", color: "#EB2F96" },
    { id: 3, name: "แสงสว่าง", color: "#FAAD14" },
    { id: 4, name: "อุณหภูมิ", color: "#2F54EB" },
    { id: 5, name: "ประตู", color: "#13C2C2" },
    { id: 6, name: "พัดลมดูดอากาศ", color: "#EB2F96" },
    { id: 7, name: "แสงสว่าง", color: "#FAAD14" },
    { id: 8, name: "อุณหภูมิ", color: "#2F54EB" },
  ];

  const toggleDevice = (device) => {
    if (selected.find((d) => d.id === device.id)) {
      setSelected(selected.filter((d) => d.id !== device.id));
    } else {
      setSelected([...selected, device]);
    }
  };
  return (
    <Modal open={open} onCancel={onClose} footer={null} width={1000} centered>
      <h3 style={{ marginBottom: 16 }}>เลือกอุปกรณ์</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {devices.map((device) => {
          const active = selected.find((d) => d.id === device.id);

          return (
            <div
              key={device.id}
              onClick={() => toggleDevice(device)}
              style={{
                padding: 16,
                borderRadius: 16,
                border: active ? "2px solid #13C2C2" : "1px solid #f0f0f0",
                cursor: "pointer",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: device.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {device.name.charAt(0)}
              </div>

              <div>
                <div style={{ fontWeight: 600 }}>{device.name}</div>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  ชั้น 2 · Co-Working space 2
                </div>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  อาคารการเรียนการสอนและปฏิบัติการ
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        <Button style={{ flex: 1 }} onClick={onClose}>
          ยกเลิก
        </Button>
        <Button
          type="primary"
          style={{ flex: 1, background: "#13C2C2" }}
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
