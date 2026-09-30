import { useState } from "react";
import { Modal, Button, ConfigProvider, DatePicker } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const DATE_FORMAT = "DD MMM YYYY";

const modalTheme = {
  token: {
    colorPrimary: "#13C2C2",
    colorPrimaryHover: "#13C2C2",
  },
  components: {
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
};

const isAfterToday = (date) => date.isAfter(dayjs(), "day");

const formatRangeLimit = (months) =>
  months % 12 === 0 ? `${months / 12} ปี` : `${months} เดือน`;

function ReportRangeForm({
  label,
  icon,
  maxRangeMonths,
  allowFutureDates,
  loading,
  onCancel,
  onConfirm,
}) {
  const isWithinMaxRange = (from, to) =>
    to.isBefore(from.add(maxRangeMonths, "month"), "day");

  const [from, setFrom] = useState(dayjs().startOf("month"));
  const [to, setTo] = useState(dayjs().startOf("day"));

  const handleChangeFrom = (value) => {
    setFrom(value);

    if (value && to && (to.isBefore(value, "day") || !isWithinMaxRange(value, to))) {
      setTo(null);
    }
  };

  const disabledFromDate = (date) =>
    (!allowFutureDates && isAfterToday(date)) ||
    (to &&
      (date.isAfter(to, "day") ||
        !date.isAfter(to.subtract(maxRangeMonths, "month"), "day")));

  const disabledToDate = (date) =>
    (!allowFutureDates && isAfterToday(date)) ||
    (from && (date.isBefore(from, "day") || !isWithinMaxRange(from, date)));

  const handleConfirm = () => {
    onConfirm({ from: from.format("YYYY-MM-DD"), to: to.format("YYYY-MM-DD") });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2">
        <DownloadOutlined style={{ fontSize: 20, color: "#13C2C2" }} />
        <h3 className="m-0 text-[18px] font-semibold">Download Report</h3>
      </div>

      {/* Content */}
      <div className="mt-6 flex-1">
        <div className="flex items-center gap-4">
          <label className="text-[16px] font-semibold">ประเภท</label>
          <div className="flex h-8 items-center gap-2 rounded-full bg-[#F5F5F5] px-3 text-[14px]">
            {icon}
            <span>{label}</span>
          </div>
        </div>

        <label className="mt-6 block text-[16px] font-semibold">ช่วงเวลา</label>
        <div className="mt-2 flex gap-4">
          <div className="min-w-0 flex-1">
            <label className="mb-2 block text-[14px]">ตั้งแต่</label>
            <DatePicker
              className="w-full"
              size="large"
              placeholder="วันที่เริ่มต้น"
              format={DATE_FORMAT}
              allowClear={false}
              value={from}
              disabledDate={disabledFromDate}
              onChange={handleChangeFrom}
            />
          </div>

          <div className="min-w-0 flex-1">
            <label className="mb-2 block text-[14px]">ถึง</label>
            <DatePicker
              className="w-full"
              size="large"
              placeholder="วันที่สิ้นสุด"
              format={DATE_FORMAT}
              allowClear={false}
              value={to}
              disabledDate={disabledToDate}
              onChange={setTo}
            />
          </div>
        </div>
        <p className="mt-2 text-[12px] text-[#8C8C8C]">
          เลือกช่วงวันที่ได้ไม่เกิน {formatRangeLimit(maxRangeMonths)}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 flex gap-4">
        <Button
          onClick={onCancel}
          disabled={loading}
          className="!h-[40px] flex-1 !rounded-[8px] !font-medium"
        >
          ยกเลิก
        </Button>

        <Button
          type="primary"
          onClick={handleConfirm}
          loading={loading}
          disabled={!from || !to}
          className="!h-[40px] flex-1 !rounded-[8px] !font-medium"
        >
          ยืนยัน
        </Button>
      </div>
    </div>
  );
}

function DownloadReportModal({
  open,
  label,
  icon,
  maxRangeMonths,
  allowFutureDates = false,
  loading,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={508}
      onCancel={loading ? undefined : onCancel}
      closable={!loading}
      maskClosable={!loading}
      destroyOnHidden
      styles={{
        content: {
          borderRadius: 8,
          padding: 24,
        },
      }}
    >
      <ConfigProvider theme={modalTheme}>
        <ReportRangeForm
          label={label}
          icon={icon}
          maxRangeMonths={maxRangeMonths}
          allowFutureDates={allowFutureDates}
          loading={loading}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      </ConfigProvider>
    </Modal>
  );
}

export default DownloadReportModal;
