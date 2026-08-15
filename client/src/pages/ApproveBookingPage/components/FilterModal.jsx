import { useState } from "react";
import { Modal, Select, Button, ConfigProvider, Checkbox } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import FilterIcon from "../../../assets/icons/approve-booking/FilterIcon";

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


  const handleToggleStatus = (value) => {
    setStatusGroups((prev) =>
        prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const isAllFloorsSelected = floorOptions.length > 0 && floorOptions.every((item) => floors.includes(item.value));
  const isAllBookingTypesSelected = bookingTypeOptions.length > 0 && bookingTypeOptions.every((item) => bookingTypes.includes(item.value));

  const handleReset = () => {
    setBookingTypes(allBookingTypeValues);
    setFloors(allFloorValues);
    setStatusGroups([]);
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
          height: 428,
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
                    placeholder="เลือกประเภทการจอง"
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
                    placeholder="เลือกชั้น"
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