import { Modal, Input } from "antd";
import { useMemo, useState } from "react";
import { CheckOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import CalendarOutlineIcon from "../../../assets/icons/approve-booking/CalendarOutlineIcon";
import ClockIcon from "../../../assets/icons/approve-booking/ClockIcon";
import DeviceIcon from "../../../assets/icons/approve-booking/DeviceIcon";
import BookingTypeIcon from "../../../assets/icons/approve-booking/BookingTypeIcon";
import Approve from "../../../assets/images/approve-booking/Approve";

const formatDate = (date, format = "DD MMM YYYY") =>
  date ? dayjs(date).format(format) : "-";

const formatTimeRange = (start, end) =>
  start && end
    ? `${dayjs(start).format("HH:mm")}–${dayjs(end).format("HH:mm")} น.`
    : "-";

function BookingCard({ booking, selected, onSelect }) {
  return (
    <div className="h-full w-full overflow-hidden rounded-[16px] border border-[#D9D9D9]">
      {/* Card Header */}
      <div
        className={`
          flex
          h-[48px]
          items-center
          justify-between
          gap-2
          px-4
          ${selected ? "bg-[#95DE64]" : "bg-[#F0F0F0]"}
        `}
      >
        <span className="min-w-0 truncate text-[15px] font-semibold text-[#262626]">
          {selected ? "รายการที่จะอนุมัติ" : "รายการที่จะถูกยกเลิก"}
        </span>

        <button
          type="button"
          onClick={onSelect}
          className={`
            flex
            h-[32px]
            shrink-0
            items-center
            gap-2
            rounded-[6px]
            px-3
            text-[13px]
            font-medium
            transition
            ${
              selected
                ? "border border-[#13C2C2] bg-[#E6FFFB] text-[#08979C]"
                : "border border-[#13C2C2] bg-[#13C2C2] text-white hover:bg-[#08979C]"
            }
          `}
        >
          <CheckOutlined />

          {selected ? "เลือกอยู่" : "เลือก"}
        </button>
      </div>

      {/* Card Body */}
      <div className="px-4 py-4 text-left">
        {/* Meeting Name */}
        <div className="mb-4 truncate text-[17px] font-semibold text-[#262626]">
          {booking?.meetingName || "-"}
        </div>

        <div className="space-y-3">
          {/* Date */}
          <div className="flex items-center gap-3">
            <CalendarOutlineIcon size={20} className="shrink-0" />

            <span className="text-[14px] text-[#262626]">
              {formatDate(booking?.startTime)}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <ClockIcon size={20} className="shrink-0" />

            <span className="text-[14px] font-medium text-[#08979C]">
              {formatTimeRange(booking?.startTime, booking?.endTime)}
            </span>
          </div>

          {/* Room */}
          <div className="flex items-start gap-3">
            <DeviceIcon size={20} className="shrink-0" />

            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-medium text-[#262626]">
                {booking?.title || "-"}
              </div>

              <div className="mt-1 flex min-w-0 items-center gap-2 text-[12px] text-[#262626]">
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
            <BookingTypeIcon width={20} height={22} className="shrink-0" />

            <span className="min-w-0 truncate text-[14px] text-[#262626]">
              {booking?.bookingType || "-"}
            </span>
          </div>
        </div>

        {/* Purpose */}
        <div className="mt-3 flex min-h-[40px] items-center rounded-[8px] bg-[#FFF1B8] px-3 py-2 text-[13px] text-[#262626]">
          {booking?.purpose || "-"}
        </div>

        {/* Card Footer */}
        <div className="mt-4 text-[12px] text-[#595959]">
          <div className="flex items-center gap-2">
            <span>วันที่ทำรายการ</span>

            <ClockCircleOutlined className="text-[16px] !text-[#4096FF]" />

            <span>{formatDate(booking?.createdAt, "DD/MM/YY")}</span>
          </div>

          <div className="mt-1 truncate">{booking?.bookingBy || "-"}</div>
        </div>
      </div>
    </div>
  );
}

function DuplicatedModal({
  open = false,
  onCancel,
  onConfirm,
  selectedBooking,
}) {
  const [selectedApproveId, setSelectedApproveId] = useState(
    () => selectedBooking?.booking?.id ?? null,
  );

  const [note, setNote] = useState("");

  const bookings = useMemo(() => {
    const mainBooking = selectedBooking?.booking;

    const rawConflicts = selectedBooking?.conflicts;

    const conflicts = Array.isArray(rawConflicts)
      ? rawConflicts
      : rawConflicts
        ? [rawConflicts]
        : [];

    if (!mainBooking) {
      return [];
    }

    const uniqueBookings = Array.from(
      new Map(
        [mainBooking, ...conflicts].map((booking) => [booking.id, booking]),
      ).values(),
    );

    return uniqueBookings.sort(
      (a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf(),
    );
  }, [selectedBooking]);

  const handleConfirm = () => {
    const approveBooking = bookings.find(
      (item) => item.id === selectedApproveId,
    );

    const cancelBookings = bookings.filter(
      (item) => item.id !== selectedApproveId,
    );

    if (!approveBooking) {
      return;
    }

    onConfirm?.({
      approveBooking,
      cancelBookings,
      note,
    });
  };

  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={960}
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
      <div className="flex max-h-[calc(100vh-80px)] flex-col">
        {/* Header */}
        <div className="shrink-0 text-center">
          <div className="flex w-full justify-center">
            <div
              className="
                flex
                w-[120px]
                items-center
                justify-center

                [&>svg]:block
                [&>svg]:mx-auto
                [&>svg]:h-auto
                [&>svg]:max-w-full

                [&>img]:block
                [&>img]:mx-auto
                [&>img]:h-auto
                [&>img]:max-w-full
              "
            >
              <Approve />
            </div>
          </div>

          <h3 className="mt-2 mb-0 text-[18px] font-semibold text-[#262626]">
            ยืนยันการอนุมัติการจอง?
          </h3>

          <p className="mt-2 mb-0 text-[14px] text-[#595959]">
            หากคุณอนุมัติรายการนี้
            ระบบจะยกเลิกรายการอื่นที่มีช่วงเวลาทับซ้อนกันโดยอัตโนมัติ
          </p>
        </div>

        {/* Scroll Area */}
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                selected={booking.id === selectedApproveId}
                onSelect={() => setSelectedApproveId(booking.id)}
              />
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mt-5 shrink-0">
          <label className="mb-2 block text-left text-[14px] font-medium text-[#262626]">
            หมายเหตุ
          </label>

          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            placeholder="หมายเหตุ"
            className="
              !h-[40px]
              !rounded-[8px]
              hover:!border-[#13C2C2]
              focus:!border-[#13C2C2]
              focus:!shadow-none
            "
          />
        </div>

        {/* Fixed Footer */}
        <div className="mt-5 flex shrink-0 gap-3 bg-white">
          <button
            type="button"
            onClick={onCancel}
            className="
              h-[40px]
              flex-1
              rounded-[8px]
              border
              border-[#D9D9D9]
              bg-white
              text-[16px]
              font-semibold
              text-[#262626]
              transition
              hover:border-[#13C2C2]
            "
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedApproveId}
            className="
              h-[40px]
              flex-1
              rounded-[8px]
              border
              border-[#13C2C2]
              bg-[#13C2C2]
              text-[16px]
              font-semibold
              text-white
              transition
              hover:bg-[#08979C]

              disabled:cursor-not-allowed
              disabled:border-[#D9D9D9]
              disabled:bg-[#D9D9D9]
            "
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DuplicatedModal;
