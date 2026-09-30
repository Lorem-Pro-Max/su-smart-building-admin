import { Segmented } from "antd";

function OnOffSegmented({ isOn, onChange }) {
  const unlockedTextStyle = isOn ? "text-green-600 font-medium" : "";
  const lockedTextStyle = !isOn ? "text-neutral-800 font-medium" : "";

  return (
    <div style={{ width: 153, height: 52 }}>
      <Segmented
        value={isOn ? "on" : "off"}
        className="w-full h-full"
        onChange={(val) => onChange(val === "on")}
        options={[
          { label: <span className={unlockedTextStyle}>เปิด</span>, value: "on" },
          { label: <span className={lockedTextStyle}>ปิด</span>, value: "off" },
        ]}
      />
    </div>
  );
}

export default OnOffSegmented;
