import { Modal } from "antd";
import Delete from "../../../assets/images/Delete";

function DeleteConfirmModal({ open, onCancel, onConfirm }) {
  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={448}
      onCancel={onCancel}
      closable
    >
      <div className="flex flex-col items-center text-center px-6 py-4">
        <Delete />

        <h3 className="text-[18px] font-semibold">ยืนยันการลบผู้ใช้งานนี้?</h3>

        <p className="text-gray-400 text-[14px] mt-2">
          คุณต้องการลบผู้ใช้งานใช่หรือไม่?
          <br />
          เมื่อลบแล้วจะไม่สามารถกู้คืนได้ในภายหลัง
        </p>

        <div className="flex gap-3 w-full mt-6">
          <button
            className="flex-1 border border-gray-300 rounded-lg py-2
                       text-[16px] font-semibold hover:bg-gray-50"
            onClick={onCancel}
          >
            ยกเลิก
          </button>

          <button
            className="flex-1 bg-red-500 text-white rounded-lg py-2
                       text-[16px] font-semibold hover:bg-red-600"
            onClick={onConfirm}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirmModal;
