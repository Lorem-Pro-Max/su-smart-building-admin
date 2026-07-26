import OnOffSegmented from "./OnOffSegmented";

function DeviceGridCard({ Icon, name, isOn, onToggle }) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        width: 260,
        height: 228,
        background: isOn
          ? "linear-gradient(135deg, #F6FFED, #E6FFFB)"
          : "#F5F5F5",
        borderRadius: 16,
        padding: 16,
        gap: 12,
      }}
    >
      <span
        style={{ fontFamily: "var(--font-main)", fontWeight: 500, fontSize: 18 }}
      >
        {name}
      </span>

      <div className="flex items-center justify-center flex-1">
        <Icon isOn={isOn} />
      </div>

      <OnOffSegmented isOn={isOn} onChange={onToggle} />
    </div>
  );
}

export default DeviceGridCard;
