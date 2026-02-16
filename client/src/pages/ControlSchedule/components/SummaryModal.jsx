import { Modal, Button } from "antd";
import dayjs from "dayjs";

function SummaryModal({
  open,
  onClose,
  room,
  devices,
  settingType,
  date,
  time,
}) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} width={1100} centered>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-center">
          สรุปข้อมูลการตั้งเปิด-ปิด อุปกรณ์
        </h2>
        <p className="text-center text-gray-500 mb-6">
          โปรดตรวจสอบรายละเอียดก่อนยืนยันการจอง
        </p>

        <div className="border rounded-2xl p-6 space-y-6">
          <div>
            <div className="text-gray-500 mb-2">ห้องหรือพื้นที่ *</div>
            <div className="p-4 rounded-2xl border border-gray-200 w-[320px]">
              <div className="font-semibold">{room?.name}</div>
              <div className="text-xs text-gray-500">ชั้น {room?.floor}</div>
            </div>
          </div>

          <div>
            <div className="text-gray-500 mb-2">อุปกรณ์</div>
            <div className="grid grid-cols-3 gap-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="p-4 rounded-2xl border border-gray-200 flex gap-4 items-center"
                >
                  <div
                    className="w-12 h-12 rounded-xl"
                    style={{ background: device.color }}
                  />
                  <div>
                    <div className="font-semibold">{device.name}</div>
                    <div className="text-xs text-gray-500">
                      ชั้น {room?.floor} · {room?.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <div className="text-gray-500">ประเภทการตั้งค่า</div>
              <div className="font-medium">
                {settingType === "open" ? "เปิด" : "ปิด"}
              </div>
            </div>

            <div>
              <div className="text-gray-500">วันที่ทำการจอง</div>
              <div className="font-medium">
                {date ? dayjs(date).format("DD MMM YYYY") : "-"}
              </div>
            </div>

            <div>
              <div className="text-gray-500">เวลาที่ต้องการจอง</div>
              <div className="font-medium">
                {time ? dayjs(time).format("HH:mm") + " น." : "-"}
              </div>
            </div>

            <div>
              <div className="text-gray-500">ผู้ตั้งเวลา</div>
              <div className="font-medium">ดวงจันทร์ จันทร์กระจ่าง</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button className="flex-1 h-12" onClick={onClose}>
            แก้ไขข้อมูล
          </Button>

          <Button type="primary" className="flex-1 h-12 !bg-teal-500">
            ยืนยันการจอง
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SummaryModal;
