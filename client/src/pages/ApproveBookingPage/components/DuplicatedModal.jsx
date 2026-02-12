import { Modal } from "antd";
import dayjs from "dayjs";

const formatDate = (date, format = "DD MMM YYYY") =>
  date ? dayjs(date).format(format) : "-";

const formatTimeRange = (start, end) =>
  start && end
    ? `${dayjs(start).format("HH:mm")} – ${dayjs(end).format("HH:mm")} น.`
    : "-";

function BookingCard({ title, booking, headerColor }) {
  return (
    <div className="w-full mt-4 rounded-xl border border-gray-200 overflow-hidden">
      <div
        className={`${headerColor} px-4 py-2 text-left text-[16px] font-bold`}
      >
        {title}
      </div>

      <div className="px-4 py-3 text-left text-sm space-y-2">
        <p className="text-[18px] font-bold">{booking?.meetingName || "-"}</p>

        <div className="flex items-center gap-2 text-gray-600">
          <img
            src="src/assets/icons/approve-booking/calendar.svg"
            className="w-[24px] h-[24px]"
          />
          <span className="text-[16px]">{formatDate(booking?.startTime)}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <img
            src="src/assets/icons/approve-booking/time.svg"
            className="w-[24px] h-[24px]"
          />
          <span className="text-[16px] text-[#08979C]">
            {formatTimeRange(booking?.startTime, booking?.endTime)}
          </span>
        </div>

        <div className="flex items-start gap-2 text-gray-600">
          <img
            src="src/assets/icons/approve-booking/room.svg"
            className="w-[24px] h-[24px]"
          />

          <div className="flex flex-col gap-2">
            <span className="text-[16px]">{booking?.title || "-"}</span>
            <span className="text-[16px]">ชั้น {booking?.floor || "-"}</span>
          </div>
        </div>

        <p className="text-[14px] text-gray-400 mt-2">
          {booking?.bookingBy || "-"}
        </p>

        <p className="text-[14px] text-gray-400 mt-2">
          วันที่ทำรายการ {formatDate(booking?.createdAt, "DD/MM/YY")}
        </p>
      </div>
    </div>
  );
}

function DuplicatedModal({
  open = true,
  onCancel,
  onConfirm,
  selectedBooking,
}) {
  const booking = selectedBooking?.booking;
  const cancelBooking = selectedBooking?.conflicts;

  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={720}
      onCancel={onCancel}
      closable
    >
      <div className="flex flex-col items-center text-center">
        <img
          src="src/assets/images/approve.svg"
          className="w-[160px] h-[160px] m-4"
        />

        <h3 className="text-lg font-semibold">ยืนยันการอนุมัติการจอง?</h3>

        <p className="text-gray-500 text-sm mt-1">
          หากคุณอนุมัติรายการนี้ระบบจะย
          ยกเลิกรายการอื่นที่มีช่วงเวลาทับซ้อนโดยอัตโนมัติ
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mt-6">
          <BookingCard
            title="รายการที่จะอนุมัติ"
            booking={booking}
            headerColor="bg-[#B7EB8F]"
          />

          <BookingCard
            title="รายการที่จะถูกยกเลิก"
            booking={cancelBooking}
            headerColor="bg-gray-100"
          />
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

export default DuplicatedModal;
