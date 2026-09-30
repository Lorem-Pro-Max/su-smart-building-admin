import { Modal, Button } from "antd";
import Deleted from "../../../assets/images/approve-booking/Delete";

function DeletedModal({
  open,
  count = 0,
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={440}
      maskClosable={false}
    >
      <div className="flex flex-col items-center">
        <Deleted width={160} height={160} />

        <h2 className="mt-5 mb-0 text-[20px] font-semibold text-[#262626]">
          ยืนยันการลบการจองนี้?
        </h2>

        <div className="mt-2 text-center text-[16px] leading-[24px] text-[#595959]">
          <p className="m-0">คุณต้องการลบ {count} รายการ นี้ใช่หรือไม่?</p>
          <p className="m-0">เมื่อคุณลบแล้วจะไม่สามารถกู้คืนได้</p>
        </div>

        <div className="flex w-full gap-2 mt-6">
          <Button
            onClick={onCancel}
            disabled={loading}
            className="!h-[40px] !flex-1 !font-semibold"
          >
            ยกเลิก
          </Button>

          <Button
            type="primary"
            danger
            loading={loading}
            onClick={onConfirm}
            className="!h-[40px] !flex-1 !font-semibold"
          >
            ยืนยันลบ
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default DeletedModal;
