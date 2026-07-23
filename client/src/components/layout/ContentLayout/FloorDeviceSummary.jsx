const labelTextStyle = {
  fontFamily: "var(--font-main)",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "20px",
  letterSpacing: "0.25px",
  color: "rgba(0, 0, 0, 0.85)",
};

const countTextStyle = {
  fontFamily: "var(--font-main)",
  fontWeight: 500,
  fontSize: 20,
  lineHeight: "32px",
  letterSpacing: "0.25px",
  color: "rgba(0, 0, 0, 0.85)",
};

function SummaryPill({ dotColor, label, count, background }) {
  return (
    <div
      className="flex flex-col flex-1"
      style={{
        background,
        borderRadius: 8,
        padding: "4px 12px",
        gap: 4,
      }}
    >
      <span style={labelTextStyle}>{label}</span>
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: dotColor }}
        />
        <span style={countTextStyle}>{count}</span>
      </div>
    </div>
  );
}

function DeviceSummaryCard({ Icon, label, onCount, offCount }) {
  return (
    <div
      className="flex flex-col flex-1"
      style={{
        background: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        gap: 12,
        boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className="flex items-center" style={{ gap: 8, height: 24 }}>
        <Icon />
        <span
          style={{
            fontFamily: "var(--font-main)",
            fontWeight: 500,
            fontSize: 16,
          }}
        >
          {label}
        </span>
      </div>

      <div className="flex" style={{ gap: 8, height: 64 }}>
        <SummaryPill
          dotColor="#52C41A"
          label="เปิดอยู่"
          count={onCount}
          background="linear-gradient(135deg, #F6FFED, #E6FFFB)"
        />
        <SummaryPill
          dotColor="#8C8C8C"
          label="ปิดอยู่"
          count={offCount}
          background="#F5F5F5"
        />
      </div>
    </div>
  );
}

function FloorDeviceSummary({ floorNum, groups }) {
  return (
    <div className="w-full">
      <div className="flex w-full" style={{ gap: 16 }}>
        {groups.map((group) => {
          const rooms = group.data[floorNum] || [];
          const onCount = rooms.filter((room) => room.isOn).length;

          return (
            <DeviceSummaryCard
              key={group.key}
              Icon={group.Icon}
              label={group.label}
              onCount={onCount}
              offCount={rooms.length - onCount}
            />
          );
        })}
      </div>
    </div>
  );
}

export default FloorDeviceSummary;
