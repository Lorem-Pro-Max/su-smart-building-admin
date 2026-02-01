import { Modal } from "antd";

function BookingModal({ open = true, onCancel, onConfirm }) {
  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={508}
      onCancel={onCancel}
      closable
    >
      <div className="flex flex-col items-center text-center">
        <img
          src="src/assets/images/approve.svg"
          alt="approve"
          className="w-[160px] h-[160px] m-4"
        />

        <h3 className="text-lg font-semibold">ยืนยันการอนุมัติการจอง?</h3>

        <p className="text-gray-500 text-sm mt-1">
          คุณต้องการอนุมัติการจองห้องเรียนนี้หรือไม่?
        </p>

        <div className="w-full mt-4 rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-[#B7EB8F] px-4 py-2 text-left text-[16px] font-bold">
            รายการที่จะอนุมัติ
          </div>

          <div className="px-4 py-3 text-left text-sm space-y-2">
            <p className="text-[18px] font-bold">ระบบบันทึกจอง 1</p>

            <div className="flex items-center gap-2 text-gray-600">
              <img
                src="src/assets/icons/approve-booking/calendar.svg"
                alt="approve"
                className="w-[24px] h-[24px]"
              />
              <span className="text-[16px]">27 Dec 2025</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <img
                src="src/assets/icons/approve-booking/time.svg"
                alt="approve"
                className="w-[24px] h-[24px]"
              />
              <span className="text-[16px] text-[#08979C]">
                08:00 – 09:00 น.
              </span>
            </div>

            <div className="flex items-start gap-2 text-gray-600">
              <img
                src="src/assets/icons/approve-booking/room.svg"
                alt="approve"
                className="w-[24px] h-[24px]"
              />

              <div className="flex flex-col gap-2">
                <span className="text-[16px]">ห้องเรียน 5</span>
                <span className="text-[16px]">
                  ชั้น 4 อาคารการเรียนการสอนและปฏิบัติการ
                </span>
              </div>
            </div>

            <p className="text-[14px] text-gray-400 mt-2">
              ดวงจันทร์ จันทร์กระจ่าง
            </p>
            <p className="text-[14px] text-gray-400 mt-2">
              วันที่ทำรายการ 17/12/25
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full mt-6">
          <button
            className="flex-1 border rounded-lg py-2 hover:bg-gray-50 text-[18px] font-bold"
            onClick={onCancel}
          >
            ยกเลิก
          </button>

          <button
            className="flex-1 bg-teal-400 text-white rounded-lg py-2 hover:bg-teal-500 text-[18px] font-bold"
            onClick={onConfirm}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default BookingModal;
