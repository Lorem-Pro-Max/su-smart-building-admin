import { useState } from "react";
import {
  Modal,
  Select,
  Button,
  ConfigProvider,
  Checkbox,
  DatePicker,
  TimePicker,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import FilterIcon from "../../../assets/icons/approve-booking/FilterIcon";
import {
  BOOKING_TIME_FORMAT,
  formatTime,
  toTimeOfDay,
} from "../../CreateBookingPage/utils/bookingTime";

const DATE_FORMAT = "DD MMM YYYY";

const range = (start, end) =>
  Array.from({ length: end - start }, (_, index) => start + index);

const buildEndTimeDisabled = (minTime) => () => {
  if (!minTime) return {};

  const [minHour, minMinute] = minTime.split(":").map(Number);

  return {
    disabledHours: () => range(0, minHour),
    disabledMinutes: (selectedHour) =>
      selectedHour === minHour ? range(0, minMinute + 1) : [],
  };
};

function FilterModal({
  open,
  onCancel,
  onConfirm,
  initialFilters,
  floorOptions = [],
  bookingTypeOptions = [],
  statusOptions = [],
}) {

  const allFloorValues = floorOptions.map((item) => item.value);
  const allBookingTypeValues = bookingTypeOptions.map((item) => item.value);
  const [statusGroups, setStatusGroups] = useState(initialFilters?.statusGroups ?? []);
  const [floors, setFloors] = useState(initialFilters?.floors?.length ? initialFilters.floors : allFloorValues);
  const [bookingTypes, setBookingTypes] = useState(initialFilters?.bookingTypes?.length ? initialFilters.bookingTypes : allBookingTypeValues);
  const [date, setDate] = useState(initialFilters?.date ? dayjs(initialFilters.date) : null);
  const [startTime, setStartTime] = useState(initialFilters?.startTime ?? null);
  const [endTime, setEndTime] = useState(initialFilters?.endTime ?? null);


  const handleToggleStatus = (value) => {
    setStatusGroups((prev) =>
        prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const isAllFloorsSelected = floorOptions.length > 0 && floorOptions.every((item) => floors.includes(item.value));
  const isAllBookingTypesSelected = bookingTypeOptions.length > 0 && bookingTypeOptions.every((item) => bookingTypes.includes(item.value));

  const handleChangeDate = (value) => {
    setDate(value);

    if (!value) {
      setStartTime(null);
      setEndTime(null);
    }
  };

  const handleChangeStartTime = (value) => {
    const nextStartTime = formatTime(value);

    setStartTime(nextStartTime);

    if (nextStartTime && endTime && endTime <= nextStartTime) {
      setEndTime(null);
    }
  };

  const handleReset = () => {
    setBookingTypes(allBookingTypeValues);
    setFloors(allFloorValues);
    setStatusGroups([]);
    setDate(null);
    setStartTime(null);
    setEndTime(null);
  };

  const handleConfirm = () => {
    const selectedStatuses = statusOptions
        .filter((item) => statusGroups.includes(item.value))
        .flatMap((item) => item.statuses);

    onConfirm?.({
        bookingTypes: isAllBookingTypesSelected ? null : bookingTypes,
        floors: isAllFloorsSelected ? null : floors,
        statuses: selectedStatuses,
        statusGroups,
        date: date ? date.format("YYYY-MM-DD") : null,
        startTime,
        endTime,
    });
  };

  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={508}
      onCancel={onCancel}
      closable
      styles={{
        content: {
          borderRadius: 8,
          padding: 24,
        },
      }}
    >
        <ConfigProvider
            theme={{
            token: {
                colorPrimary: "#13C2C2",
                colorPrimaryHover: "#13C2C2",
            },
            components: {
                Select: {
                    hoverBorderColor: "#13C2C2",
                    activeBorderColor: "#13C2C2",
                    activeOutlineColor: "transparent",
                    optionSelectedBg: "#FFFFFF",
                    optionActiveBg: "#F5F5F5",
                },

                DatePicker: {
                    hoverBorderColor: "#13C2C2",
                    activeBorderColor: "#13C2C2",
                    activeOutlineColor: "transparent",
                },

                Button: {
                    defaultHoverBorderColor: "#13C2C2",
                    defaultHoverColor: "#13C2C2",
                    defaultActiveBorderColor: "#13C2C2",
                    defaultActiveColor: "#13C2C2",
                },
            },
            }}
        >
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-2">
            <FilterIcon size={24} />

            <h3 className="m-0 text-[18px] font-semibold">
                Filter
            </h3>
            </div>

            {/* Content */}
            <div className="mt-6 flex-1">
            {/* Booking Type */}
            <div>
                <label className="mb-2 block text-[16px] font-semibold">
                ประเภทการจอง
                </label>

                <Select
                    mode="multiple"
                    className="w-full"
                    popupClassName="booking-type-select-dropdown"
                    size="large"
                    placeholder="ทั้งหมด"
                    value={bookingTypes}
                    onChange={(values) => {setBookingTypes([...values].sort((a, b) => a - b))}}
                    allowClear
                    options={bookingTypeOptions}
                    maxTagCount={isAllBookingTypesSelected ? 0 : undefined}
                    maxTagPlaceholder={() => "ทั้งหมด"}
                    menuItemSelectedIcon={null}
                    optionRender={(option) => (
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={bookingTypes.includes(option.value)}
                                className="pointer-events-none"
                            />

                            <span>{option.label}</span>
                        </div>
                    )}
                />
            </div>

            {/* Floor */}
            <div className="mt-4">
                <label className="mb-2 block text-[16px] font-semibold">
                ชั้น
                </label>

                <Select
                    mode="multiple"
                    className="w-full"
                    popupClassName="floor-select-dropdown"
                    size="large"
                    placeholder="ทั้งหมด"
                    value={floors}
                    onChange={(values) => {setFloors([...values].sort((a, b) => a - b))}}
                    allowClear
                    options={floorOptions}
                    maxTagCount={isAllFloorsSelected ? 0 : undefined}
                    maxTagPlaceholder={() => "ทั้งหมด"}
                    menuItemSelectedIcon={null}
                    optionRender={(option) => (
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={floors.includes(option.value)}
                                className="pointer-events-none"
                            />
                            <span>{option.label}</span>
                        </div>
                    )}
                />
            </div>

            {/* Status */}
            <div className="mt-4">
                <label className="mb-2 block text-[16px] font-semibold">
                สถานะ
                </label>

                <div className="flex flex-wrap gap-2">
                {statusOptions.map((item) => {
                    const active = statusGroups.includes(item.value);

                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => handleToggleStatus(item.value)}
                            className={`
                            h-[36px]
                            rounded-[8px]
                            border
                            px-4
                            text-[14px]
                            transition
                            ${
                                active
                                ? "border-[#13C2C2] bg-[#E6FFFB] text-[#08979C]"
                                : "border-[#D9D9D9] bg-white text-[#595959]"
                            }
                            `}
                        >
                            {item.label}
                        </button>
                    );
                })}
                </div>
            </div>

            {/* Date */}
            <div className="mt-4">
                <label className="mb-2 block text-[16px] font-semibold">
                วันที่
                </label>

                <DatePicker
                    className="w-full"
                    size="large"
                    placeholder="วันที่"
                    format={DATE_FORMAT}
                    value={date}
                    onChange={handleChangeDate}
                />
            </div>

            {/* Time range */}
            <div className="mt-4 flex gap-4">
                <div className="min-w-0 flex-1">
                    <label className="mb-2 block text-[16px] font-semibold">
                    เวลาเริ่มต้น
                    </label>

                    <TimePicker
                        className="w-full"
                        size="large"
                        placeholder="เวลาเริ่มต้น"
                        format={BOOKING_TIME_FORMAT}
                        minuteStep={1}
                        showNow={false}
                        needConfirm={false}
                        disabled={!date}
                        value={toTimeOfDay(startTime, date ?? undefined)}
                        onChange={handleChangeStartTime}
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <label className="mb-2 block text-[16px] font-semibold">
                    เวลาสิ้นสุด
                    </label>

                    <TimePicker
                        className="w-full"
                        size="large"
                        placeholder="เวลาสิ้นสุด"
                        format={BOOKING_TIME_FORMAT}
                        minuteStep={1}
                        showNow={false}
                        needConfirm={false}
                        disabled={!date}
                        value={toTimeOfDay(endTime, date ?? undefined)}
                        disabledTime={buildEndTimeDisabled(startTime)}
                        onChange={(value) => setEndTime(formatTime(value))}
                    />
                </div>
            </div>
            </div>

            {/* Footer */}
            <div className="flex gap-4 mt-6">
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    className="!h-[40px] flex-1 !rounded-[8px] !font-medium"
                >
                    กลับค่าเริ่มต้น
                </Button>

                <Button
                    type="primary"
                    onClick={handleConfirm}
                    className="!h-[40px] flex-1 !rounded-[8px] !border-[#13C2C2] !bg-[#13C2C2] !font-medium"
                >
                    ยืนยัน
                </Button>
            </div>
        </div>
      </ConfigProvider>
    </Modal>
  );
}

export default FilterModal;
