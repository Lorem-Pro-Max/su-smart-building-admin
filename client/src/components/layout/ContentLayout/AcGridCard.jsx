import OnOffSegmented from "./OnOffSegmented";
import TemperatureButton from "@pages/AirConditionersControlPage/components/TemperatureButton.jsx";

function AcGridCard({ title, device, Icon, isOn, onToggle, tempControl }) {
  return (
    <div
      className="flex flex-col"
      style={{
        width: 540,
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
        {title}
      </span>

      <div className="flex items-center justify-center" style={{ gap: 24 }}>
        <Icon isOn={isOn} />

        <div className="flex flex-col items-center" style={{ gap: 4 }}>
          <span style={{ fontFamily: "var(--font-main)", fontWeight: 500 }}>
            อุณหภูมิ
          </span>
          <TemperatureButton
            roomId={device.id}
            roomTemp={device.status?.temp}
            control={tempControl}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <OnOffSegmented isOn={isOn} onChange={onToggle} />
      </div>
    </div>
  );
}

export default AcGridCard;
