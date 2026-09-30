import { WEEKDAY_OPTIONS } from "../../utils/recurrence";

function WeekdayPicker({ value = [], onChange, disabled = false }) {
  const toggle = (day) =>
    onChange(value.includes(day) ? value.filter((item) => item !== day) : [...value, day]);

  return (
    <div className="flex gap-2">
      {WEEKDAY_OPTIONS.map((day) => {
        const selected = value.includes(day.value);

        return (
          /* type="button" บังคับ — อยู่ใน antd Form ถ้าไม่ใส่จะ submit ฟอร์ม
             key ใช้ value ไม่ใช่ label เพราะ label ซ้ำ (T,T และ S,S) */
          <button
            key={day.value}
            type="button"
            title={day.full}
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => toggle(day.value)}
            className={`h-8 w-8 shrink-0 rounded-full text-[13px] font-medium transition hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
              selected
                ? "bg-[#13C2C2] text-white"
                : "bg-[#F5F5F5] text-[#8C8C8C] hover:bg-[#EBEBEB]"
            }`}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}

export default WeekdayPicker;
