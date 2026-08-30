import { Alert, Checkbox, Modal } from "antd";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

import { formatBookingRanges } from "../../utils/bookingTime";
import { MAX_OCCURRENCES, formatRecurrenceSummary } from "../../utils/recurrence";

/* แยกเนื้อในออกมาเพื่อให้ mount ใหม่ทุกครั้งที่เปิด — selection จึง seed จาก useState
   ไม่ต้อง sync ด้วย useEffect ซึ่งทำให้เกิด cascading render */
function PreviewBody({
  onCancel,
  onConfirm,
  occurrences = [],
  room,
  pattern,
  anchorDate,
  startTime,
  endTime,
  loading = false,
  truncated = false,
  skippedMonths = [],
}) {
  const selectableKeys = useMemo(
    () => occurrences.filter((item) => item.conflicts.length === 0).map((item) => item.key),
    [occurrences],
  );

  /* ตั้งต้น = ติ๊กเฉพาะใบที่ไม่ชน */
  const [selectedKeys, setSelectedKeys] = useState(() => new Set(selectableKeys));

  const toggle = (key) =>
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const conflictCount = occurrences.length - selectableKeys.length;
  const allConflict = selectableKeys.length === 0;
  const dayOfMonth = anchorDate ? dayjs(anchorDate).date() : null;

  return (
    <div className="flex max-h-[calc(100vh-120px)] flex-col">
        <div className="shrink-0">
          <h3 className="mb-0 text-[18px] font-semibold text-[#262626]">
            ยืนยันการจองต่อเนื่อง
          </h3>
          <p className="mt-1 mb-0 text-[14px] text-[#595959]">
            {room?.title} · {startTime} - {endTime} · {formatRecurrenceSummary(pattern, anchorDate)}
          </p>

          {truncated && (
            <Alert
              type="warning"
              showIcon
              className="mt-3"
              message={`รูปแบบนี้เกิน ${MAX_OCCURRENCES} รายการ ระบบแสดงเฉพาะ ${MAX_OCCURRENCES} รายการแรก`}
            />
          )}

          {skippedMonths.length > 0 && (
            <Alert
              type="info"
              showIcon
              className="mt-2"
              message={`ข้ามเดือนที่ไม่มีวันที่ ${dayOfMonth}: ${skippedMonths
                .map((month) => dayjs(month).format("MMM YYYY"))
                .join(", ")}`}
            />
          )}

          <div className="mt-3 flex items-center justify-between border-b border-[#F0F0F0] pb-2">
            <Checkbox
              checked={!allConflict && selectedKeys.size === selectableKeys.length}
              indeterminate={
                selectedKeys.size > 0 && selectedKeys.size < selectableKeys.length
              }
              disabled={allConflict}
              onChange={(event) =>
                setSelectedKeys(new Set(event.target.checked ? selectableKeys : []))
              }
            >
              เลือกทั้งหมด
            </Checkbox>
            <span className="text-[12px] text-[#8C8C8C]">
              ทั้งหมด {occurrences.length} รายการ
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-2 pr-1">
          {occurrences.map((occurrence, index) => {
            const hasConflict = occurrence.conflicts.length > 0;

            return (
              <label
                key={occurrence.key}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                  hasConflict
                    ? "cursor-not-allowed border-[#FFCCC7] bg-[#FFF1F0]"
                    : "cursor-pointer border-[#F0F0F0] bg-white hover:bg-[#FAFAFA]"
                }`}
              >
                <Checkbox
                  disabled={hasConflict}
                  checked={selectedKeys.has(occurrence.key)}
                  onChange={() => toggle(occurrence.key)}
                />
                <span className="w-6 shrink-0 text-[12px] text-[#BFBFBF]">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="mb-0 text-[14px] text-[#262626]">
                    {occurrence.date.format("ddd DD MMM YYYY")}
                    {occurrence.isAnchor && (
                      <span className="ml-2 rounded bg-mint-light px-1.5 py-0.5 text-[11px] text-mint-darker">
                        รายการแรก
                      </span>
                    )}
                  </p>
                  <p className="mb-0 text-[12px] text-[#8C8C8C]">
                    {startTime} - {endTime}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[12px] ${
                    hasConflict ? "text-[#CF1322]" : "text-[#52C41A]"
                  }`}
                >
                  {hasConflict
                    ? `ชนกับ ${formatBookingRanges(occurrence.conflicts)}`
                    : "ว่าง"}
                </span>
              </label>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-[#F0F0F0] pt-3">
          {allConflict ? (
            <p className="mb-3 text-[13px] text-[#CF1322]">
              ทุกรายการชนกับการจองเดิม กรุณาเปลี่ยนเวลา ห้อง หรือรูปแบบการทำซ้ำ
            </p>
          ) : (
            <p className="mb-3 text-[13px] text-[#595959]">
              จะสร้าง{" "}
              <span className="font-semibold text-[#262626]">{selectedKeys.size}</span> จาก{" "}
              {occurrences.length} รายการ
              {conflictCount > 0 ? ` · ชนเวลา ${conflictCount} รายการ` : ""}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-[#D9D9D9] py-2 text-[#595959] transition hover:bg-gray-50 hover:cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={selectedKeys.size === 0 || loading}
              onClick={() =>
                onConfirm(occurrences.filter((item) => selectedKeys.has(item.key)))
              }
              className={`flex-1 rounded-lg py-2 text-white! transition ${
                selectedKeys.size === 0 || loading
                  ? "cursor-not-allowed bg-gray-300"
                  : "bg-mint-dark hover:bg-mint-darker hover:cursor-pointer"
              }`}
            >
              ยืนยันการจอง
            </button>
          </div>
      </div>
    </div>
  );
}

function RecurrencePreviewModal({ open, ...props }) {
  return (
    <Modal
      open={open}
      onCancel={props.onCancel}
      footer={null}
      centered
      width={640}
      closable
      styles={{
        content: { borderRadius: 8, padding: "24px 24px 20px", overflow: "hidden" },
      }}
      destroyOnHidden
    >
      {open && <PreviewBody {...props} />}
    </Modal>
  );
}

export default RecurrencePreviewModal;
