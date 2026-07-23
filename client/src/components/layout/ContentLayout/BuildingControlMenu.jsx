import { CardButton } from "@components/utils";

const columnWidth = 168;
const buttonStyle = { width: columnWidth, height: 48, borderRadius: 16 };

function StatusPill({ dotColor, label }) {
  return (
    <div
      className="flex items-center gap-1.5"
      style={{
        background: "#E6FFFB",
        borderRadius: 24,
        height: 20,
        padding: "0 8px",
        width: columnWidth,
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: dotColor }}
      />
      <span
        className="whitespace-nowrap"
        style={{
          fontFamily: "var(--font-main)",
          fontWeight: 500,
          fontSize: 14,
          lineHeight: "20px",
          letterSpacing: "0.25px",
          color: "rgba(0, 0, 0, 0.85)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function BuildingControlMenu({
  onOpen,
  onClose,
  openIcon,
  closeIcon,
  onCount = 0,
  offCount = 0,
}) {
  return (
    <div
      className="flex gap-1"
      style={{
        background: "#B5F5EC",
        borderRadius: 22,
        padding: 6,
        boxShadow: "1px 2px 10px 0px rgba(142, 142, 142, 0.25)",
      }}
    >
      <div className="flex flex-col gap-1">
        <StatusPill dotColor="#52C41A" label={`เปิดอยู่ ${onCount} ห้อง`} />
        <div onClick={onOpen} className="cursor-pointer">
          <CardButton
            icon={openIcon}
            bgColor={"#52C41A"}
            text={`เปิดทั้งอาคาร`}
            style={buttonStyle}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <StatusPill dotColor="#FF4D4F" label={`ปิดอยู่ ${offCount} ห้อง`} />
        <div onClick={onClose} className="cursor-pointer">
          <CardButton
            icon={closeIcon}
            bgColor={"#8C8C8C"}
            text={`ปิดทั้งอาคาร`}
            style={buttonStyle}
          />
        </div>
      </div>
    </div>
  );
}
