import { Modal, Button } from "antd";
import NoSelection from "../../../assets/images/approve-booking/NoSelection";

function NoSelectionModal({ open = false, onCancel }) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={552}
      closable
      maskClosable={false}
      styles={{
        content: {
          borderRadius: 10,
          padding: "24px 30px 30px",
        },
      }}
    >
      <div className="flex flex-col items-center">
        {/* Image */}
        <div className="mt-5 flex justify-center">
          <NoSelection width={180} height={180} />
        </div>

        {/* Title */}
        <h2
          className="
            mt-6
            mb-0
            text-center
            text-[22px]
            font-semibold
            leading-[30px]
            text-[#262626]
          "
        >
          ยังไม่ได้เลือกรายการ
        </h2>

        {/* Description */}
        <p
          className="
            mt-3
            mb-0
            max-w-[440px]
            text-center
            text-[18px]
            leading-[30px]
            text-[#595959]
          "
        >
          กรุณาเลือกรายการจองที่ต้องการอนุมัติ ปฏิเสธ หรือลบ
          <br />
          อย่างน้อย 1 รายการ
        </p>

        {/* Button */}
        <Button
          onClick={onCancel}
          className="
                !mt-8
                !h-[48px]
                !w-full
                !rounded-[8px]
                !border-[#D9D9D9]
                !text-[18px]
                !font-semibold
                !text-[#262626]

                hover:!border-[#13C2C2]
                hover:!text-[#13C2C2]

                active:!border-[#08979C]
                active:!text-[#08979C]
            "
        >
          ตกลง
        </Button>
      </div>
    </Modal>
  );
}

export default NoSelectionModal;
