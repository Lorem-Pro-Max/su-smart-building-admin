import { Popover } from "antd";
import { CloseOutlined, RetweetOutlined } from "@ant-design/icons";
import { useState } from "react";

import RecurrenceForm from "./RecurrenceForm";
import { formatRecurrenceSummary } from "../../utils/recurrence";

function RecurrenceField({ anchorDate, value, onChange }) {
  const [open, setOpen] = useState(false);

  const summary = value ? formatRecurrenceSummary(value, anchorDate) : "";

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomLeft"
      styles={{ body: { padding: 16, width: 320 } }}
      content={
        <RecurrenceForm
          key={open ? "open" : "closed"}
          anchorDate={anchorDate}
          value={value}
          onSave={(pattern) => {
            onChange(pattern);
            setOpen(false);
          }}
        />
      }
    >
      {value ? (
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-mint-dark bg-mint-light px-3 py-1 text-[13px] text-mint-darker hover:cursor-pointer">
          <RetweetOutlined className="shrink-0" />
          <span className="truncate" title={summary}>
            {summary}
          </span>
          {/* stopPropagation จำเป็น ไม่งั้นคลิกกากบาทจะไปเปิด popover ด้วย */}
          <CloseOutlined
            role="button"
            aria-label="ยกเลิกการจองต่อเนื่อง"
            className="shrink-0 text-[10px] hover:cursor-pointer"
            onClick={(event) => {
              /* กันคลิกทะลุไป toggle popover — จึงต้องสั่งปิดเองด้วย
                 ไม่งั้น popover ค้างเปิดอยู่ทั้งที่รูปแบบถูกล้างไปแล้ว */
              event.stopPropagation();
              onChange(null);
              setOpen(false);
            }}
          />
        </span>
      ) : (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-mint-dark bg-white px-3 py-1 text-[13px] text-mint-dark transition hover:bg-mint-light hover:cursor-pointer"
        >
          <RetweetOutlined /> จองต่อเนื่อง
        </button>
      )}
    </Popover>
  );
}

export default RecurrenceField;
