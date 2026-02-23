import { Modal, Form, Select } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";
import CalendarOutlineIcon from "../../../assets/icons/approve-booking/CalendarOutlineIcon";
import ClockIcon from "../../../assets/icons/approve-booking/ClockIcon";
import DeviceIcon from "../../../assets/icons/approve-booking/ClockIcon";
import Decline from "../../../assets/images/Decline";

function DeclinedModal({ open, onCancel, onConfirm, selectedBooking }) {
  const [form] = Form.useForm();

  const booking = selectedBooking?.booking;
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = (values) => {
    onConfirm?.(values.rejectReason, booking);
  };

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
    <Modal open={open} footer={null} centered width={508} onCancel={onCancel}>
      <div className="flex flex-col items-center text-center m-4">
        <Decline />

        <h3 className="text-lg font-semibold">ยืนยันไม่อนุมัติการจอง?</h3>

        <p className="text-gray-500 text-sm mt-1">
          โปรดระบุเหตุผลในการไม่อนุมัติการจอง
        </p>

        <div className="w-full mt-4 rounded-xl border border-gray-200 overflow-hidden mb-4">
          <div className="bg-red-200 px-4 py-2 text-left text-[16px] font-bold">
            รายการที่จะปฏิเสธ
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

        <Form
          form={form}
          layout="vertical"
          className="w-full mt-8"
          onFinish={handleFinish}
        >
          <Form.Item
            label={
              <span>
                เหตุผลที่ปฏิเสธ <span className="text-red-500">*</span>
              </span>
            }
            name="rejectReason"
            rules={[{ required: true, message: "กรุณาเลือกเหตุผลที่ปฏิเสธ" }]}
          >
            <Select placeholder="เลือกเหตุผล">
              <Select.Option value="room_not_available">
                ห้องปิดปรับปรุง
              </Select.Option>
              <Select.Option value="time_conflict">เวลาซ้ำซ้อน</Select.Option>
              <Select.Option value="policy">ไม่เป็นไปตามเงื่อนไข</Select.Option>
              <Select.Option value="other">อื่น ๆ</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex gap-3 w-full mt-6">
            <button
              type="button"
              className="flex-1 border rounded-lg py-2 hover:bg-gray-50 text-[18px] font-bold"
              onClick={onCancel}
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="flex-1 bg-red-500 text-white rounded-lg py-2 hover:bg-red-600 text-[18px] font-bold"
            >
              ยืนยัน
            </button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export default DeclinedModal;
