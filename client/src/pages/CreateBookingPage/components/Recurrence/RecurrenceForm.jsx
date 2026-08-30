import { DatePicker, Select } from "antd";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

import WeekdayPicker from "./WeekdayPicker";
import {
  MAX_INTERVAL,
  MAX_OCCURRENCES,
  MAX_UNTIL_MONTHS,
  RECURRENCE_UNIT,
  clampInterval,
  createEmptyPattern,
  formatRecurrenceSummary,
  generateOccurrenceDates,
} from "../../utils/recurrence";

const UNIT_OPTIONS = [
  { value: RECURRENCE_UNIT.WEEK, label: "สัปดาห์" },
  { value: RECURRENCE_UNIT.MONTH, label: "เดือน" },
];

/**
 * เนื้อในของ popover — เก็บ draft state ไว้ในตัวเอง ไม่ส่งขึ้น Form.jsx จนกว่าจะกดบันทึก
 * ถ้าปล่อยให้ทุกการกดวิ่งขึ้นไป Form.jsx จะ re-render ทั้งฟอร์ม
 * TimeInput จะรัน getConflictingApprovedBookings ใหม่ และ BookingCard จะ re-render ทั้งลิสต์
 */
function RecurrenceForm({ anchorDate, value, onSave }) {
  /* seed ครั้งเดียวตอน mount — RecurrenceField ใส่ key ให้ component นี้ remount ทุกครั้งที่เปิด popover
     จึงไม่ต้อง sync ด้วย useEffect (ซึ่งจะทำให้เกิด cascading render) */
  const [draft, setDraft] = useState(() => value ?? createEmptyPattern(anchorDate));

  const patch = (changes) => setDraft((prev) => ({ ...prev, ...changes }));

  const handleUnitChange = (unit) =>
    patch({ unit, interval: clampInterval(draft.interval, unit) });

  const pattern = useMemo(() => ({ ...draft }), [draft]);

  /* นับจาก "วันที่" อย่างเดียว ไม่ผูกกับเวลา — popover นี้คุมเฉพาะวัน
     ส่วนเวลาถูกบังคับให้กรอกครบแล้วใน preSubmitCheck ก่อนจะมาถึงขั้น preview
     (ถ้าเอา buildOccurrences มานับตรงนี้ จะได้ 0 เสมอเมื่อยังไม่ได้เลือกเวลา) */
  const { dates, skippedMonths } = useMemo(() => {
    if (!draft.untilDate) return { dates: [], skippedMonths: [] };
    return generateOccurrenceDates({ anchorDate, pattern });
  }, [anchorDate, pattern, draft.untilDate]);

  const totalGenerated = dates.length;

  /* ตัวอย่างวันแบบย่อ — ตัวเลขรวมอย่างเดียวมองไม่เห็นว่าระบบข้ามเดือนที่ไม่มีวันที่นั้นให้
     เช่นจองวันที่ 31 แล้วเห็น "31 Jan · 31 Mar · 31 May" จะเข้าใจทันที */
  const datePreview = useMemo(() => {
    if (dates.length === 0) return "";
    const head = dates.slice(0, 3).map((date) => date.format("ddd D MMM")).join(" · ");
    const rest = dates.length - 3;
    return rest > 0 ? `${head} · อีก ${rest}` : head;
  }, [dates]);

  const isWeekly = draft.unit === RECURRENCE_UNIT.WEEK;

  let blockingMessage = null;
  if (isWeekly && (draft.weekdays?.length ?? 0) === 0) {
    blockingMessage = "กรุณาเลือกวันอย่างน้อย 1 วัน";
  } else if (!draft.untilDate) {
    blockingMessage = "กรุณาเลือกวันสิ้นสุด";
  } else if (totalGenerated === 0) {
    blockingMessage = "รูปแบบนี้ไม่มีวันที่ที่จองได้";
  } else if (totalGenerated > MAX_OCCURRENCES) {
    blockingMessage = `เกิน ${MAX_OCCURRENCES} รายการ กรุณาลดช่วงวันที่`;
  }

  const canSave = !blockingMessage;

  const disabledUntilDate = (current) => {
    if (!current) return false;
    const anchor = dayjs(anchorDate);
    return (
      current.isBefore(anchor, "day") ||
      current.isAfter(anchor.add(MAX_UNTIL_MONTHS, "month").endOf("day"))
    );
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-[#595959]">ทำซ้ำทุก</span>
        <Select
          size="small"
          className="w-16"
          value={draft.interval}
          onChange={(interval) => patch({ interval })}
          options={Array.from({ length: MAX_INTERVAL[draft.unit] }, (_, index) => ({
            value: index + 1,
            label: String(index + 1),
          }))}
        />
        <Select
          size="small"
          className="w-24"
          value={draft.unit}
          onChange={handleUnitChange}
          options={UNIT_OPTIONS}
        />
      </div>
      {/* ที่นี่คือจุดที่ "ทุกสัปดาห์" อ่านเป็นภาษาคน ส่วน label ด้านบนคงที่ตามดีไซน์
          ไม่เปลี่ยนตาม N เพื่อไม่ให้แถวกระตุกตอนเลื่อนเลข */}
      <p className="mt-1 mb-0 text-[12px] text-[#8C8C8C]">
        {formatRecurrenceSummary(pattern, anchorDate)}
      </p>

      {isWeekly && (
        <>
          <p className="mb-2 mt-3 text-[13px] text-[#595959]">กดเลือกวันที่ต้องการ</p>
          <WeekdayPicker
            value={draft.weekdays}
            onChange={(weekdays) => patch({ weekdays })}
          />
        </>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span className="shrink-0 text-[13px] text-[#595959]">จนถึงวันที่</span>
        <DatePicker
          size="small"
          className="flex-1"
          format="DD MMM YYYY"
          value={draft.untilDate}
          onChange={(untilDate) => patch({ untilDate })}
          disabledDate={disabledUntilDate}
        />
      </div>

      <p
        className={`mt-2 mb-0 text-[12px] ${blockingMessage ? "text-[#FF4D4F]" : "text-[#8C8C8C]"
          }`}
      >
        {blockingMessage ?? `จองรวม ${totalGenerated} รายการ`}
      </p>

      {!blockingMessage && datePreview && (
        <p className="mt-0.5 mb-0 text-[12px] leading-relaxed text-[#8C8C8C]">
          {datePreview}
        </p>
      )}

      {!blockingMessage && skippedMonths.length > 0 && (
        <p className="mt-1 mb-0 text-[12px] leading-relaxed text-[#D46B08]">
          ข้ามเดือนที่ไม่มีวันที่ {dayjs(anchorDate).date()}:{" "}
          {skippedMonths.map((month) => month.format("MMM YYYY")).join(", ")}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={!canSave}
          onClick={() => onSave(pattern)}
          className={`rounded-md px-4 py-1.5 text-[13px] text-white! transition ${canSave
            ? "bg-mint-dark hover:bg-mint-darker hover:cursor-pointer"
            : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}

export default RecurrenceForm;
