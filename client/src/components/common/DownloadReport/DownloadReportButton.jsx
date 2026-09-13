import { useState } from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useToast } from "@components/utils";
import { downloadReport } from "@services/report";
import { REPORT_MAX_RANGE_MONTHS } from "@config/reports";
import DownloadReportModal from "./DownloadReportModal";

function DownloadReportButton({ report, icon }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { successToast, errorToast, contextHolder } = useToast();

  const handleConfirm = async ({ from, to }) => {
    setLoading(true);

    try {
      await downloadReport({
        type: report.type,
        from,
        to,
        fileName: `รายงาน${report.fileLabel}_${from}_${to}.csv`,
      });
      successToast("ดาวน์โหลดรายงานเรียบร้อยแล้ว");
      setOpen(false);
    } catch (error) {
      errorToast(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Button
        icon={<DownloadOutlined style={{ color: "#13C2C2" }} />}
        onClick={() => setOpen(true)}
        className="!h-[40px] !px-5 !font-medium !border-[#13C2C2] !text-[#262626] !bg-[#E6FFFB]"
      >
        Download Report
      </Button>

      <DownloadReportModal
        open={open}
        label={report.label}
        icon={icon}
        maxRangeMonths={report.maxRangeMonths ?? REPORT_MAX_RANGE_MONTHS}
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default DownloadReportButton;
