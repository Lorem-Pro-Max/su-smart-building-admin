import { Modal, Button } from "antd";
import { SmokeDetectionIcon } from "@assets/icons";

export const SmokeAlertModal = ({ visible, data, onClose }) => {
  if (!data) return null;

  return (
    <Modal
      title={<span className="font-semibold text-lg">แจ้งเตือนด่วน</span>}
      open={visible}
      onCancel={onClose}
      centered
      footer={null}
      width={400}
    >
      <div className="flex flex-col items-center">
        <div className="mb-6 w-full flex justify-center">
          <div className="w-48 h-32  rounded flex items-center justify-center ">
            <SmokeDetectionIcon />
          </div>
        </div>

        <div className="bg-[#FF2D2D] text-white text-2xl font-bold py-3 px-10 rounded-2xl shadow-sm mb-4">
          {data.message || "ตรวจพบควันไฟ"}
        </div>

        <div className="text-[#FF2D2D] text-2xl font-bold mb-8">
          ชั้น {data.floor} {data.room}
        </div>

        <Button
          onClick={onClose}
          className="w-full h-12 text-lg font-medium rounded-xl border-gray-300 text-gray-700"
        >
          ปิด
        </Button>
      </div>
    </Modal>
  );
};

export default SmokeAlertModal;
