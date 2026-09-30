import { Modal, Form, Input } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";
import { ClockCircleOutlined } from "@ant-design/icons";

import CalendarOutlineIcon from "../../../assets/icons/approve-booking/CalendarOutlineIcon";
import ClockIcon from "../../../assets/icons/approve-booking/ClockIcon";
import DeviceIcon from "../../../assets/icons/approve-booking/DeviceIcon";
import BookingTypeIcon from "../../../assets/icons/approve-booking/BookingTypeIcon";
import Decline from "../../../assets/images/approve-booking/Decline";

function DeclinedModal({ open, onCancel, onConfirm, bookings = [] }) {
  const [form] = Form.useForm();

  const isMultiple = bookings.length > 1;

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleFinish = (values) => {
    const items = bookings.map((booking) => ({
      id: booking.id,
      rejectReason: values.reasons?.[booking.id],
    }));

    onConfirm?.(items);
  };

  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={isMultiple ? 1024 : 508}
      onCancel={onCancel}
      closable
      styles={{
        content: {
          borderRadius: 8,
          padding: "24px 24px 20px",
          overflow: "hidden",
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
        className="flex max-h-[calc(100vh-80px)] flex-col"
      >
        {/* Header */}
        <div className="shrink-0 text-center">
          <div className="flex w-full justify-center">
            <div
              className={`flex items-center justify-center [&>svg]:block [&>svg]:mx-auto [&>svg]:max-w-full [&>svg]:h-auto ${isMultiple ? "w-[120px]" : "w-[150px]"}`}
            >
              <Decline />
            </div>
          </div>

          <h3
            className={`mb-0 font-semibold text-[#262626] ${isMultiple ? "mt-2 text-[18px]" : "mt-3 text-[18px]"}`}
          >
            ยืนยันไม่อนุมัติการจอง?
          </h3>

          <p
            className={`mb-0 text-[#595959] ${isMultiple ? "mt-1 text-[14px]" : "mt-2 text-[16px]"}`}
          >
            โปรดระบุเหตุผลที่ไม่อนุมัติการจอง
          </p>
        </div>

        {/* Scroll Area */}
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <div
            className={
              isMultiple
                ? "grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 xl:grid-cols-3"
                : "grid grid-cols-1"
            }
          >
            {bookings.map((booking) => {
              const bookingDate = booking?.startTime
                ? dayjs(booking.startTime).format("DD MMM YYYY")
                : "-";

              const bookingTime =
                booking?.startTime && booking?.endTime
                  ? `${dayjs(booking.startTime).format(
                      "HH:mm",
                    )}–${dayjs(booking.endTime).format("HH:mm")} น.`
                  : "-";

              const createdDate = booking?.createdAt
                ? dayjs(booking.createdAt).format("DD/MM/YY")
                : "-";

              return (
                <div key={booking.id} className="min-w-0">
                  {/* Booking Card */}
                  <div className="w-full overflow-hidden rounded-[16px] border border-[#D9D9D9]">
                    {/* Card Header */}
                    <div
                      className={`bg-[#FFCCC7] px-4 py-3 text-left font-semibold text-[#262626] ${isMultiple ? "text-[15px]" : "text-[16px]"}`}
                    >
                      รายการที่ปฏิเสธ
                    </div>

                    {/* Card Body */}
                    <div
                      className={`text-left ${isMultiple ? "px-4 py-4" : "px-4 py-4"}`}
                    >
                      {/* Meeting Name */}
                      <div
                        className={`mb-4 truncate font-semibold text-[#262626] ${isMultiple ? "text-[16px]" : "text-[18px]"}`}
                      >
                        {booking?.meetingName || "-"}
                      </div>

                      <div className={isMultiple ? "space-y-2.5" : "space-y-3"}>
                        {/* Date */}
                        <div className="flex items-center gap-3">
                          <CalendarOutlineIcon
                            size={isMultiple ? 20 : 22}
                            className="shrink-0"
                          />

                          <span
                            className={`text-[#262626] ${isMultiple ? "text-[14px]" : "text-[16px]"}`}
                          >
                            {bookingDate}
                          </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-3">
                          <ClockIcon
                            size={isMultiple ? 20 : 22}
                            className="shrink-0"
                          />

                          <span
                            className={` font-medium text-[#08979C] ${isMultiple ? "text-[14px]" : "text-[16px]"}`}
                          >
                            {bookingTime}
                          </span>
                        </div>

                        {/* Room */}
                        <div className="flex items-start gap-3">
                          <DeviceIcon
                            size={isMultiple ? 20 : 22}
                            className="shrink-0"
                          />

                          <div className="min-w-0 flex-1">
                            <div
                              className={`truncate font-medium text-[#262626] ${isMultiple ? "text-[14px]" : "text-[16px]"}`}
                            >
                              {booking?.title || "-"}
                            </div>

                            <div
                              className={`mt-1 flex min-w-0 items-center gap-2 text-[#262626] ${isMultiple ? "text-[12px]" : "text-[14px]"}`}
                            >
                              <span className="shrink-0 whitespace-nowrap">
                                ชั้น {booking?.floor ?? "-"}
                              </span>

                              {booking?.buildingName && (
                                <span className="min-w-0 truncate">
                                  {booking.buildingName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Booking Type */}
                        <div className="flex min-w-0 items-center gap-3">
                          <BookingTypeIcon
                            width={isMultiple ? 20 : 22}
                            height={isMultiple ? 22 : 24}
                            className="shrink-0"
                          />

                          <span
                            className={`min-w-0 truncate text-[#262626] ${isMultiple ? "text-[14px]" : "text-[16px]"}`}
                          >
                            {booking?.bookingType || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Purpose - แสดงเสมอ */}
                      <div
                        className={`mt-3 flex min-h-[40px] items-center rounded-[8px] bg-[#FFF1B8] px-3 py-2 text-[#262626] ${isMultiple ? "text-[13px]" : "text-[15px]"}`}
                      >
                        {booking?.purpose || "-"}
                      </div>

                      {/* Card Footer */}
                      {isMultiple ? (
                        <div className="mt-4 text-[11px] text-[#595959]">
                          {/* Created Date */}
                          <div className="flex items-center gap-2">
                            <span>วันที่ทำรายการ</span>

                            <ClockCircleOutlined className="text-[16px] !text-[#4096FF]" />

                            <span>{createdDate}</span>
                          </div>

                          {/* Booking By */}
                          <div className="mt-1 truncate">
                            {booking?.bookingBy || "-"}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5 flex items-center justify-between gap-3 text-[13px] text-[#595959]">
                          <div className="flex shrink-0 items-center gap-2">
                            <span>วันที่ทำรายการ</span>

                            <ClockCircleOutlined className="text-[18px] !text-[#4096FF]" />

                            <span>{createdDate}</span>
                          </div>

                          <span className="min-w-0 truncate text-right">
                            {booking?.bookingBy || "-"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reject Reason */}
                  <Form.Item
                    className="!mb-0 !mt-4"
                    label={
                      <span
                        className={`font-medium text-[#262626] ${isMultiple ? "text-[14px]" : "text-[16px]"}`}
                      >
                        เหตุผลที่ปฏิเสธ
                      </span>
                    }
                    name={["reasons", booking.id]}
                  >
                    <Input
                      size="large"
                      placeholder="เหตุผลที่ปฏิเสธ"
                      maxLength={500}
                      className="!h-[40px] !rounded-[8px] hover:!border-[#13C2C2] focus:!border-[#13C2C2] focus:!shadow-none"
                    />
                  </Form.Item>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="mt-4 flex shrink-0 gap-3 bg-white pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-[40px] flex-1 rounded-[8px] border border-[#D9D9D9] bg-white text-[16px] font-semibold text-[#262626] transition hover:border-[#13C2C2]"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            className="h-[40px] flex-1 rounded-[8px] border border-[#13C2C2] bg-[#13C2C2] text-[16px] font-semibold text-white transition hover:bg-[#08979C]"
          >
            ยืนยัน
          </button>
        </div>
      </Form>
    </Modal>
  );
}

export default DeclinedModal;
