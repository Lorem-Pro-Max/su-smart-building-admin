import { Modal } from "antd";
import dayjs from "dayjs";
import CalendarOutlineIcon from "../../../assets/icons/approve-booking/CalendarOutlineIcon";
import ClockIcon from "../../../assets/icons/approve-booking/ClockIcon";
import DeviceIcon from "../../../assets/icons/approve-booking/ClockIcon";
import Approve from "../../../assets/images/Approve";

function BookingModal({ open, onCancel, onConfirm, selectedBooking }) {
  const booking = selectedBooking?.booking;
  const bookingDate = booking?.startTime
    ? dayjs(booking.startTime).format("DD MMM YYYY")
    : "-";

  const bookingTime =
    booking?.startTime && booking?.endTime
      ? `${dayjs(booking.startTime).format("HH:mm")} – ${dayjs(
          booking.endTime,
        ).format("HH:mm")} น.`
      : "-";

  const createdDate = booking?.createdAt
    ? dayjs(booking.createdAt).format("DD/MM/YY")
    : "-";

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
        <Approve />
        <h3 className="text-lg font-semibold">ยืนยันการอนุมัติการจอง?</h3>

        <p className="text-gray-500 text-sm mt-1">
          คุณต้องการอนุมัติการจองห้องเรียนนี้หรือไม่?
        </p>

        <div className="w-full mt-4 rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-[#B7EB8F] px-4 py-2 text-left text-[16px] font-bold">
            รายการที่จะอนุมัติ
          </div>

          <div className="px-4 py-3 text-left text-sm space-y-2">
            <p className="text-[18px] font-bold">
              {booking?.meetingName || "-"}
            </p>

            <div className="flex items-center gap-2 text-gray-600">
              <CalendarOutlineIcon />
              <span className="text-[16px]">{bookingDate}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <ClockIcon />
              <span className="text-[16px] text-[#08979C]">{bookingTime}</span>
            </div>

            <div className="flex items-start gap-2 text-gray-600">
              <DeviceIcon />

              <div className="flex flex-col gap-2">
                <span className="text-[16px]">{booking?.title || "-"}</span>
                <span className="text-[16px]">
                  ชั้น {booking?.floor || "-"}
                </span>
              </div>
            </div>

            <p className="text-[14px] text-gray-400 mt-2">
              {booking?.bookingBy || "-"}
            </p>

            <p className="text-[14px] text-gray-400 mt-2">
              วันที่ทำรายการ {createdDate}
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
            onClick={() => onConfirm?.(booking)}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default BookingModal;
