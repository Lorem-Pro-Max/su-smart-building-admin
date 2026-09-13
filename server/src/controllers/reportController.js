import {
  REPORTS,
  MAX_REPORT_ROWS,
  countReportRows,
  fetchReportRows,
} from "../services/reportService.js";
import { toCsv } from "../utils/csv.js";
import { handleError } from "../utils/errorFormatter.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// ต้องตรงกับ REPORT_MAX_RANGE_MONTHS ใน client/src/config/reports.js
const DEFAULT_MAX_RANGE_MONTHS = 12;

const parseDate = (value) => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isRealDate ? date : null;
};

const addMonths = (date, months) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDayOfMonth)));
};

const formatRangeLimit = (months) =>
  months % 12 === 0 ? `${months / 12} ปี` : `${months} เดือน`;

const validateRange = (from, to, maxRangeMonths) => {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  if (!fromDate || !toDate) {
    throw { status: 400, message: "กรุณาระบุช่วงวันที่ให้ถูกต้อง (YYYY-MM-DD)" };
  }
  if (fromDate > toDate) {
    throw { status: 400, message: "วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด" };
  }
  if (toDate >= addMonths(fromDate, maxRangeMonths)) {
    throw {
      status: 400,
      message: `เลือกช่วงวันที่ได้ไม่เกิน ${formatRangeLimit(maxRangeMonths)}`,
    };
  }
};

export const downloadReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { from, to } = req.query;

    const report = REPORTS[type];
    if (!report) throw { status: 404, message: "ไม่พบประเภทรายงาน" };

    validateRange(from, to, report.maxRangeMonths ?? DEFAULT_MAX_RANGE_MONTHS);

    const query = report.buildQuery({ from, to, roomIds: req.allowedRoomIds });

    if ((await countReportRows(query)) > MAX_REPORT_ROWS) {
      throw {
        status: 400,
        message: "ข้อมูลมากเกินไป กรุณาเลือกช่วงวันที่ให้สั้นลง",
      };
    }

    const rows = await fetchReportRows(query);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${type}_${from}_${to}.csv"`,
    );
    return res.send(toCsv(report.columns, rows));
  } catch (error) {
    return handleError(res, error, `GET /reports/${req.params.type}`);
  }
};
